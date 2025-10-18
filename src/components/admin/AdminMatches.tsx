import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Match {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  location: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team?: { name: string };
  away_team?: { name: string };
  leagues?: { name: string };
}

interface Team {
  id: string;
  name: string;
  league_id: string;
}

interface League {
  id: string;
  name: string;
}

const AdminMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    location: "",
    status: "scheduled",
    home_score: null as number | null,
    away_score: null as number | null,
  });

  useEffect(() => {
    fetchLeagues();
    fetchMatches();
  }, []);

  useEffect(() => {
    if (formData.league_id) {
      fetchTeamsByLeague(formData.league_id);
    }
  }, [formData.league_id]);

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from("leagues")
      .select("id, name")
      .order("name");

    if (error) {
      toast.error("Error al cargar ligas");
    } else {
      setLeagues(data || []);
    }
  };

  const fetchTeamsByLeague = async (leagueId: string) => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, league_id")
      .eq("league_id", leagueId)
      .order("name");

    if (error) {
      toast.error("Error al cargar equipos");
    } else {
      setTeams(data || []);
    }
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name),
        leagues(name)
      `)
      .order("match_date", { ascending: false });

    if (error) {
      toast.error("Error al cargar partidos");
      console.error(error);
    } else {
      setMatches(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      home_score: formData.status === "completed" ? formData.home_score : null,
      away_score: formData.status === "completed" ? formData.away_score : null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("matches")
        .update(submitData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error al actualizar partido");
      } else {
        toast.success("Partido actualizado");
        resetForm();
        fetchMatches();
      }
    } else {
      const { error } = await supabase.from("matches").insert([submitData]);

      if (error) {
        toast.error("Error al crear partido");
      } else {
        toast.success("Partido creado");
        resetForm();
        fetchMatches();
      }
    }
  };

  const handleEdit = (match: Match) => {
    setEditingId(match.id);
    setFormData({
      league_id: match.league_id,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      match_date: match.match_date,
      location: match.location,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este partido?")) return;

    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar partido");
    } else {
      toast.success("Partido eliminado");
      fetchMatches();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      league_id: "",
      home_team_id: "",
      away_team_id: "",
      match_date: "",
      location: "",
      status: "scheduled",
      home_score: null,
      away_score: null,
    });
    setTeams([]);
  };

  const getTeamName = (match: Match, isHome: boolean) => {
    if (isHome && match.home_team) return match.home_team.name;
    if (!isHome && match.away_team) return match.away_team.name;
    return "Equipo desconocido";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      scheduled: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      scheduled: "Programado",
      in_progress: "En progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">
          {editingId ? "Editar Partido" : "Nuevo Partido"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="league_id">Liga</Label>
            <Select
              value={formData.league_id}
              onValueChange={(value) => setFormData({ ...formData, league_id: value, home_team_id: "", away_team_id: "" })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecciona una liga" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="home_team_id">Equipo local</Label>
              <Select
                value={formData.home_team_id}
                onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}
                disabled={!formData.league_id}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Equipo local" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="away_team_id">Equipo visitante</Label>
              <Select
                value={formData.away_team_id}
                onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}
                disabled={!formData.league_id}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Equipo visitante" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter((t) => t.id !== formData.home_team_id).map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="match_date">Fecha y hora</Label>
              <Input
                id="match_date"
                type="datetime-local"
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "completed" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home_score">Puntos local</Label>
                <Input
                  id="home_score"
                  type="number"
                  min="0"
                  value={formData.home_score || ""}
                  onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || null })}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="away_score">Puntos visitante</Label>
                <Input
                  id="away_score"
                  type="number"
                  min="0"
                  value={formData.away_score || ""}
                  onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || null })}
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" className="bg-gradient-primary">
              {editingId ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingId ? "Actualizar" : "Crear"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="border-border">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partidos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay partidos registrados aún
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partido</TableHead>
                    <TableHead>Liga</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {getTeamName(match, true)} vs {getTeamName(match, false)}
                      </TableCell>
                      <TableCell>
                        {match.leagues?.name || "Sin liga"}
                      </TableCell>
                      <TableCell>
                        {new Date(match.match_date).toLocaleString("es-ES")}
                      </TableCell>
                      <TableCell>{match.location}</TableCell>
                      <TableCell>
                        {match.status === "completed" && match.home_score !== null ? (
                          <span className="font-bold text-primary">
                            {match.home_score} - {match.away_score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(match)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(match.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMatches;

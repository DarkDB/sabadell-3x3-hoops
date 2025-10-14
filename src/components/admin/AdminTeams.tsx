import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  logo_url: string;
  league_id: string;
  wins: number;
  losses: number;
}

interface League {
  id: string;
  name: string;
}

const AdminTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    league_id: "",
    wins: 0,
    losses: 0,
  });

  useEffect(() => {
    fetchLeagues();
    fetchTeams();
  }, []);

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

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar equipos");
    } else {
      setTeams(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("teams")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error al actualizar equipo");
      } else {
        toast.success("Equipo actualizado");
        resetForm();
        fetchTeams();
      }
    } else {
      const { error } = await supabase.from("teams").insert([formData]);

      if (error) {
        toast.error("Error al crear equipo");
      } else {
        toast.success("Equipo creado");
        resetForm();
        fetchTeams();
      }
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setFormData({
      name: team.name,
      logo_url: team.logo_url,
      league_id: team.league_id,
      wins: team.wins,
      losses: team.losses,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar equipo");
    } else {
      toast.success("Equipo eliminado");
      fetchTeams();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      logo_url: "",
      league_id: "",
      wins: 0,
      losses: 0,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">
          {editingId ? "Editar Equipo" : "Nuevo Equipo"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del equipo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="league_id">Liga</Label>
            <Select
              value={formData.league_id}
              onValueChange={(value) => setFormData({ ...formData, league_id: value })}
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

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del logo</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://..."
              className="bg-input border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wins">Victorias</Label>
              <Input
                id="wins"
                type="number"
                min="0"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="losses">Derrotas</Label>
              <Input
                id="losses"
                type="number"
                min="0"
                value={formData.losses}
                onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })}
                className="bg-input border-border"
              />
            </div>
          </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-4 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-card-foreground">{team.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Record: {team.wins}V - {team.losses}D
                </p>
                {team.logo_url && (
                  <img src={team.logo_url} alt={team.name} className="w-16 h-16 object-contain mt-2" />
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(team)}
                  className="border-border"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(team.id)}
                  className="border-border text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTeams;

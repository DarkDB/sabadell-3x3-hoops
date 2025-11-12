import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";
import PlayerStats from "@/components/dashboard/PlayerStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Player {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
  age: number | null;
  email: string | null;
}

interface TeamRegistration {
  id: string;
  team_name: string;
  number_of_players: number;
}

const DashboardTeam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<TeamRegistration | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    jersey_number: "",
    position: "",
    age: "",
    email: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: regData } = await supabase
      .from("team_registrations")
      .select("id, team_name, number_of_players")
      .eq("user_id", user.id)
      .maybeSingle();

    if (regData) {
      setRegistration(regData);
      await fetchPlayers(regData.id);
    }
    setLoading(false);
  };

  const fetchPlayers = async (teamRegistrationId: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_registration_id", teamRegistrationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }

    setPlayers(data || []);
  };

  const handleAddPlayer = async () => {
    if (!registration || !newPlayer.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del jugador es requerido",
        variant: "destructive",
      });
      return;
    }

    if (players.length >= registration.number_of_players) {
      toast({
        title: "Error",
        description: `Ya tienes el máximo de ${registration.number_of_players} jugadores registrados`,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("players").insert({
      team_registration_id: registration.id,
      name: newPlayer.name.trim(),
      jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
      position: newPlayer.position.trim() || null,
      age: newPlayer.age ? parseInt(newPlayer.age) : null,
      email: newPlayer.email.trim() || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el jugador",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Jugador agregado",
      description: "El jugador ha sido agregado exitosamente",
    });

    setIsAddDialogOpen(false);
    setNewPlayer({ name: "", jersey_number: "", position: "", age: "", email: "" });
    await fetchPlayers(registration.id);
  };

  const handleDeletePlayer = async (playerId: string) => {
    const { error } = await supabase.from("players").delete().eq("id", playerId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el jugador",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Jugador eliminado",
      description: "El jugador ha sido eliminado exitosamente",
    });

    if (registration) {
      await fetchPlayers(registration.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No tienes un equipo registrado</CardTitle>
            <CardDescription>
              Registra tu equipo para gestionar jugadores
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{registration.team_name}</h2>
          <p className="text-muted-foreground">
            {players.length} / {registration.number_of_players} jugadores
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={players.length >= registration.number_of_players}>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Jugador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Jugador</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo jugador
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, email: e.target.value })
                  }
                  placeholder="jugador@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={newPlayer.age}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, age: e.target.value })
                  }
                  placeholder="25"
                  min="10"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="jersey">Número de Camiseta</Label>
                <Input
                  id="jersey"
                  type="number"
                  value={newPlayer.jersey_number}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, jersey_number: e.target.value })
                  }
                  placeholder="23"
                />
              </div>
              <div>
                <Label htmlFor="position">Posición</Label>
                <Input
                  id="position"
                  value={newPlayer.position}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, position: e.target.value })
                  }
                  placeholder="Base, Escolta, Alero..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPlayer}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Player Statistics */}
      {players.length > 0 && (
        <PlayerStats players={players} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Roster del Equipo</CardTitle>
          <CardDescription>Lista de jugadores registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay jugadores registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Edad</TableHead>
                  <TableHead className="text-center">Número</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.email || "-"}</TableCell>
                    <TableCell className="text-center">
                      {player.age || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {player.jersey_number || "-"}
                    </TableCell>
                    <TableCell>{player.position || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTeam;

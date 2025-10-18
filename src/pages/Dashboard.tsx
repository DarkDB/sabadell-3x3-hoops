import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PlusCircle } from "lucide-react";

interface TeamRegistration {
  id: string;
  team_name: string;
  captain_name: string;
  email: string;
  phone: string;
  number_of_players: number;
  payment_status: string;
  league_id: string;
  leagues: {
    name: string;
    season: string | null;
  };
}

interface OfficialTeam {
  id: string;
  name: string;
  wins: number;
  losses: number;
}

interface Player {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<TeamRegistration | null>(null);
  const [officialTeam, setOfficialTeam] = useState<OfficialTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    jersey_number: "",
    position: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchRegistration(user.id);
    setLoading(false);
  };

  const fetchRegistration = async (userId: string) => {
    const { data, error } = await supabase
      .from("team_registrations")
      .select(`
        *,
        leagues (
          name,
          season
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching registration:", error);
      return;
    }

    if (data) {
      setRegistration(data as TeamRegistration);
      await fetchPlayers(data.id);
      await checkOfficialTeam(data.team_name, data.league_id);
    }
  };

  const checkOfficialTeam = async (teamName: string, leagueId: string) => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .eq("name", teamName)
      .eq("league_id", leagueId)
      .maybeSingle();

    if (data) {
      setOfficialTeam(data);
    }
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

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registration) return;

    try {
      const { error } = await supabase.from("players").insert({
        team_registration_id: registration.id,
        name: newPlayer.name,
        jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
        position: newPlayer.position || null,
      });

      if (error) throw error;

      toast({
        title: "Jugador agregado",
        description: "El jugador ha sido agregado exitosamente",
      });

      setNewPlayer({ name: "", jersey_number: "", position: "" });
      await fetchPlayers(registration.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("¿Estás seguro de eliminar este jugador?")) return;

    try {
      const { error } = await supabase.from("players").delete().eq("id", playerId);

      if (error) throw error;

      toast({
        title: "Jugador eliminado",
        description: "El jugador ha sido eliminado exitosamente",
      });

      setPlayers(players.filter((p) => p.id !== playerId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No tienes un equipo registrado</CardTitle>
            <CardDescription>
              Registra tu equipo para acceder al dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/")} className="w-full">
              Ir al inicio
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard - {registration.team_name}</h1>
          <Button onClick={handleLogout} variant="outline">
            Cerrar sesión
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Team Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {officialTeam && (
              <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  ✓ Equipo Oficial Aprobado
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Victorias</p>
                    <p className="text-2xl font-black text-primary">{officialTeam.wins}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Derrotas</p>
                    <p className="text-2xl font-black text-card-foreground">{officialTeam.losses}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Equipo</p>
                <p className="font-medium">{registration.team_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capitán</p>
                <p className="font-medium">{registration.captain_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liga</p>
                <p className="font-medium">
                  {registration.leagues.name}
                  {registration.leagues.season && ` - ${registration.leagues.season}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{registration.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{registration.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jugadores Registrados</p>
                <p className="font-medium">
                  {players.length} / {registration.number_of_players}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium capitalize">
                  {registration.payment_status === "pending"
                    ? "Pendiente"
                    : registration.payment_status === "paid"
                    ? "Pagado"
                    : registration.payment_status}
                </p>
              </div>
              {registration.payment_status === "pending" && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">Información de Pago</p>
                  <p className="text-sm">Método: Transferencia Bancaria</p>
                  <p className="text-sm">Cuenta: 1234-5678-9012-3456</p>
                  <p className="text-sm">Titular: Liga de Baloncesto</p>
                  <p className="text-sm">Monto: $500.00</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Una vez realizado el pago, envía el comprobante a
                    pagos@liga.com
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card>
          <CardHeader>
            <CardTitle>Jugadores del Equipo</CardTitle>
            <CardDescription>
              Agrega los jugadores de tu equipo (máximo {registration.number_of_players})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Player Form */}
            {players.length < registration.number_of_players && (
              <form onSubmit={handleAddPlayer} className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Agregar Jugador
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Nombre *</Label>
                    <Input
                      id="playerName"
                      value={newPlayer.name}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jerseyNumber">Número de Camiseta</Label>
                    <Input
                      id="jerseyNumber"
                      type="number"
                      value={newPlayer.jersey_number}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, jersey_number: e.target.value })
                      }
                      min="0"
                      max="99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Posición</Label>
                    <Input
                      id="position"
                      value={newPlayer.position}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, position: e.target.value })
                      }
                      placeholder="Ej: Base, Escolta..."
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Agregar Jugador
                </Button>
              </form>
            )}

            {/* Players List */}
            {players.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">Lista de Jugadores</h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.jersey_number && `#${player.jersey_number}`}
                          {player.jersey_number && player.position && " • "}
                          {player.position}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay jugadores registrados aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

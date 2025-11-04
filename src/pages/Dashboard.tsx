import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TeamStats } from "@/components/dashboard/TeamStats";
import { UpcomingMatches } from "@/components/dashboard/UpcomingMatches";

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

interface Match {
  id: string;
  match_date: string;
  location: string | null;
  status: string;
  home_team: { name: string };
  away_team: { name: string };
  home_score: number | null;
  away_score: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<TeamRegistration | null>(null);
  const [officialTeam, setOfficialTeam] = useState<OfficialTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
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
      await Promise.all([
        fetchPlayers(data.id),
        checkOfficialTeam(data.team_name, data.league_id),
        fetchMatches(data.team_name, data.league_id),
      ]);
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

  const fetchMatches = async (teamName: string, leagueId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .eq("league_id", leagueId)
      .or(`home_team.name.eq.${teamName},away_team.name.eq.${teamName}`)
      .order("match_date", { ascending: true })
      .limit(5);

    if (error) {
      console.error("Error fetching matches:", error);
      return;
    }

    setMatches(data || []);
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Bienvenido, {registration.captain_name}</h2>
        <p className="text-muted-foreground">{registration.team_name} - {registration.leagues.name}</p>
      </div>

      {/* Stats Section */}
      {officialTeam && (
        <TeamStats 
          wins={officialTeam.wins} 
          losses={officialTeam.losses} 
          totalPlayers={players.length}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {officialTeam && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-primary">
                  ✓ Equipo Oficial Aprobado
                </p>
              </div>
            )}
            <div className="grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Capitán</p>
                <p className="font-medium">{registration.captain_name}</p>
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
                <p className="text-sm text-muted-foreground">Jugadores</p>
                <p className="font-medium">{players.length} / {registration.number_of_players}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
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
                    ? "⏳ Pendiente"
                    : registration.payment_status === "paid"
                    ? "✓ Pagado"
                    : registration.payment_status}
                </p>
              </div>
              {registration.payment_status === "pending" && (
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium">Información de Pago</p>
                  <p>Transferencia Bancaria</p>
                  <p>Cuenta: 1234-5678-9012-3456</p>
                  <p>Monto: $500.00</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Matches */}
      <UpcomingMatches matches={matches} teamName={registration.team_name} />
    </div>
  );
};

export default Dashboard;

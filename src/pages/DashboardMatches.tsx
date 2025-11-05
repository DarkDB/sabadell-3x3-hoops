import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface OfficialTeam {
  id: string;
  name: string;
}

const DashboardMatches = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [officialTeam, setOfficialTeam] = useState<OfficialTeam | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);

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
      .select("team_name, league_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (regData) {
      await checkOfficialTeam(regData.team_name, regData.league_id);
    }
    setLoading(false);
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
      await Promise.all([
        fetchUpcomingMatches(data.id, leagueId),
        fetchCompletedMatches(data.id, leagueId),
      ]);
    }
  };

  const fetchUpcomingMatches = async (teamId: string, leagueId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .eq("league_id", leagueId)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .in("status", ["scheduled", "in_progress"])
      .order("match_date", { ascending: true });

    if (error) {
      console.error("Error fetching upcoming matches:", error);
      return;
    }

    setUpcomingMatches(data || []);
  };

  const fetchCompletedMatches = async (teamId: string, leagueId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .eq("league_id", leagueId)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
      .eq("status", "completed")
      .order("match_date", { ascending: false });

    if (error) {
      console.error("Error fetching completed matches:", error);
      return;
    }

    setCompletedMatches(data || []);
  };

  const getMatchStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Programado", variant: "default" },
      in_progress: { label: "En Curso", variant: "secondary" },
      completed: { label: "Finalizado", variant: "outline" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

  const isHomeTeam = (match: Match) => match.home_team.name === officialTeam?.name;

  const renderMatch = (match: Match) => {
    const status = getMatchStatus(match.status);
    const home = isHomeTeam(match);

    return (
      <div
        key={match.id}
        className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(match.match_date), "PPP 'a las' p", { locale: es })}
            </div>
            {match.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {match.location}
              </div>
            )}
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`font-medium ${home ? "text-primary" : ""}`}>
              {match.home_team.name}
            </p>
          </div>
          <div className="px-4 text-center min-w-[80px]">
            {match.status === "completed" ? (
              <p className="text-lg font-bold">
                {match.home_score} - {match.away_score}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">vs</p>
            )}
          </div>
          <div className="flex-1 text-right">
            <p className={`font-medium ${!home ? "text-primary" : ""}`}>
              {match.away_team.name}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!officialTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Equipo no aprobado</CardTitle>
            <CardDescription>
              Tu equipo debe ser aprobado por un administrador para ver los partidos
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Partidos</h2>
        <p className="text-muted-foreground">{officialTeam.name}</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Próximos ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Partidos</CardTitle>
              <CardDescription>Partidos programados y en curso</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay partidos próximos
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingMatches.map(renderMatch)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partidos Completados</CardTitle>
              <CardDescription>Historial de partidos finalizados</CardDescription>
            </CardHeader>
            <CardContent>
              {completedMatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay partidos completados
                </p>
              ) : (
                <div className="space-y-4">
                  {completedMatches.map(renderMatch)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardMatches;

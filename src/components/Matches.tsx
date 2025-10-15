import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
}

interface Team {
  id: string;
  name: string;
}

const Matches = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name");
    
    const teamsMap: Record<string, string> = {};
    teamsData?.forEach((team: Team) => {
      teamsMap[team.id] = team.name;
    });
    setTeams(teamsMap);

    // Fetch upcoming matches
    const { data: upcoming } = await supabase
      .from("matches")
      .select("*")
      .in("status", ["scheduled", "in_progress"])
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(4);

    if (upcoming) setUpcomingMatches(upcoming);

    // Fetch recent results
    const { data: recent } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "completed")
      .not("home_score", "is", null)
      .order("match_date", { ascending: false })
      .limit(4);

    if (recent) setRecentResults(recent);
  };

  const getTeamName = (teamId: string) => teams[teamId] || "Equipo";
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled: "Próximo",
      in_progress: "En juego",
      completed: "Finalizado",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };

  return (
    <section id="matches" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-card-foreground">
            Partidos & <span className="text-primary">Resultados</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sigue la acción y no te pierdas ningún partido
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upcoming Matches */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-card-foreground">Próximos Partidos</h3>
            <div className="space-y-4">
              {upcomingMatches.length === 0 ? (
                <Card className="bg-background border-border">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No hay partidos programados</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingMatches.map((match) => (
                  <Card key={match.id} className="bg-background border-border hover:border-primary transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          {getStatusText(match.status)}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(match.match_date)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-foreground">{getTeamName(match.home_team_id)}</div>
                        <div className="text-primary font-black">VS</div>
                        <div className="text-lg font-bold text-foreground">{getTeamName(match.away_team_id)}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(match.match_date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-card-foreground">Resultados Recientes</h3>
            <div className="space-y-4">
              {recentResults.length === 0 ? (
                <Card className="bg-background border-border">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No hay resultados disponibles</p>
                  </CardContent>
                </Card>
              ) : (
                recentResults.map((result) => (
                  <Card key={result.id} className="bg-background border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(result.match_date)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-center">
                          <div className="text-lg font-bold text-foreground mb-2">{getTeamName(result.home_team_id)}</div>
                          <div className={`text-4xl font-black ${(result.home_score ?? 0) > (result.away_score ?? 0) ? 'text-primary' : 'text-muted-foreground'}`}>
                            {result.home_score ?? 0}
                          </div>
                        </div>
                        <div className="px-6 text-muted-foreground font-bold">-</div>
                        <div className="flex-1 text-center">
                          <div className="text-lg font-bold text-foreground mb-2">{getTeamName(result.away_team_id)}</div>
                          <div className={`text-4xl font-black ${(result.away_score ?? 0) > (result.home_score ?? 0) ? 'text-primary' : 'text-muted-foreground'}`}>
                            {result.away_score ?? 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Matches;

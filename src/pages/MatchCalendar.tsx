import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, MapPin, Clock, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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

interface League {
  id: string;
  name: string;
  season: string | null;
}

const MatchCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Record<string, string>>({});
  const [leagues, setLeagues] = useState<Record<string, League>>({});
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name");

    const teamsMap: Record<string, string> = {};
    teamsData?.forEach((team: Team) => {
      teamsMap[team.id] = team.name;
    });
    setTeams(teamsMap);

    // Fetch leagues
    const { data: leaguesData } = await supabase
      .from("leagues")
      .select("*");

    const leaguesMap: Record<string, League> = {};
    leaguesData?.forEach((league: League) => {
      leaguesMap[league.id] = league;
    });
    setLeagues(leaguesMap);

    // Fetch matches for current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .gte("match_date", start.toISOString())
      .lte("match_date", end.toISOString())
      .order("match_date", { ascending: true });

    if (matchesData) {
      setMatches(matchesData);
    }

    setLoading(false);
  };

  const getTeamName = (teamId: string) => teams[teamId] || "Equipo";

  const getLeagueName = (leagueId: string) => {
    const league = leagues[leagueId];
    return league ? `${league.name}${league.season ? ` - ${league.season}` : ''}` : "Liga";
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled: "Programado",
      in_progress: "En juego",
      completed: "Finalizado",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      scheduled: "bg-blue-500/20 text-blue-500 border-blue-500",
      in_progress: "bg-green-500/20 text-green-500 border-green-500",
      completed: "bg-muted text-muted-foreground border-border",
      cancelled: "bg-red-500/20 text-red-500 border-red-500"
    };
    return colorMap[status] || "bg-muted text-muted-foreground border-border";
  };

  const matchesOnSelectedDate = matches.filter((match) =>
    isSameDay(parseISO(match.match_date), selectedDate)
  );

  const datesWithMatches = matches.map((match) => parseISO(match.match_date));

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <CalendarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Calendario de <span className="text-primary">Partidos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visualiza todos los partidos programados en un calendario interactivo
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8 gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => setViewMode("month")}
              className={viewMode === "month" ? "bg-gradient-primary" : ""}
            >
              Vista Mensual
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              className={viewMode === "week" ? "bg-gradient-primary" : ""}
            >
              Vista Semanal
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMonthChange("prev")}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMonthChange("next")}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="rounded-md border-0 w-full pointer-events-auto"
                    modifiers={{
                      hasMatch: datesWithMatches,
                    }}
                    modifiersClassNames={{
                      hasMatch: "bg-primary/20 font-bold",
                    }}
                  />
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
                      <span>Días con partidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-accent"></div>
                      <span>Hoy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Matches Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    {format(selectedDate, "d 'de' MMMM", { locale: es })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Cargando partidos...</p>
                    </div>
                  ) : matchesOnSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No hay partidos programados para este día
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matchesOnSelectedDate.map((match) => (
                        <Card key={match.id} className="border-2">
                          <CardContent className="p-4">
                            <Badge className={`mb-3 ${getStatusColor(match.status)}`}>
                              {getStatusText(match.status)}
                            </Badge>
                            
                            <div className="space-y-3">
                              {/* Teams */}
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-bold text-foreground">
                                    {getTeamName(match.home_team_id)}
                                  </p>
                                  {match.status === "completed" && match.home_score !== null && (
                                    <p className={`text-2xl font-black ${
                                      (match.home_score ?? 0) > (match.away_score ?? 0) 
                                        ? "text-primary" 
                                        : "text-muted-foreground"
                                    }`}>
                                      {match.home_score}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="px-4 text-muted-foreground font-bold">VS</div>
                                
                                <div className="flex-1 text-right">
                                  <p className="font-bold text-foreground">
                                    {getTeamName(match.away_team_id)}
                                  </p>
                                  {match.status === "completed" && match.away_score !== null && (
                                    <p className={`text-2xl font-black ${
                                      (match.away_score ?? 0) > (match.home_score ?? 0) 
                                        ? "text-primary" 
                                        : "text-muted-foreground"
                                    }`}>
                                      {match.away_score}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="space-y-1 text-sm text-muted-foreground pt-3 border-t border-border">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {format(parseISO(match.match_date), "HH:mm")}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {match.location}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4" />
                                  {getLeagueName(match.league_id)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MatchCalendar;

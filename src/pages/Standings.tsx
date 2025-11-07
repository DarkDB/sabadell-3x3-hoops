import { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  league_id: string;
  logo_url: string | null;
}

interface League {
  id: string;
  name: string;
  season: string | null;
}

const Standings = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedLeague]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch leagues
    const { data: leaguesData } = await supabase
      .from("leagues")
      .select("*")
      .order("created_at", { ascending: false });

    if (leaguesData) {
      setLeagues(leaguesData);
    }

    // Fetch teams
    let query = supabase
      .from("teams")
      .select("*")
      .order("wins", { ascending: false });

    if (selectedLeague !== "all") {
      query = query.eq("league_id", selectedLeague);
    }

    const { data: teamsData } = await query;

    if (teamsData) {
      setTeams(teamsData);
    }
    
    setLoading(false);
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return ((wins / total) * 100).toFixed(1);
  };

  const getGamesPlayed = (wins: number, losses: number) => {
    return wins + losses;
  };

  const getLeagueName = (leagueId: string | null) => {
    if (!leagueId) return "Sin liga";
    const league = leagues.find(l => l.id === leagueId);
    return league ? `${league.name}${league.season ? ` - ${league.season}` : ''}` : "Sin liga";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Tabla de <span className="text-primary">Posiciones</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clasificación completa de todos los equipos de la liga
            </p>
          </div>

          {/* League Filter */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedLeague("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLeague === "all"
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "bg-card text-card-foreground hover:bg-muted"
              }`}
            >
              Todas las Ligas
            </button>
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedLeague === league.id
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-card text-card-foreground hover:bg-muted"
                }`}
              >
                {league.name}
                {league.season && ` - ${league.season}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando clasificación...</p>
            </div>
          ) : teams.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No hay equipos registrados en esta liga
              </p>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Pos</th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Equipo</th>
                      <th className="text-center py-4 px-4 text-muted-foreground font-semibold">PJ</th>
                      <th className="text-center py-4 px-4 text-muted-foreground font-semibold">V</th>
                      <th className="text-center py-4 px-4 text-muted-foreground font-semibold">D</th>
                      <th className="text-center py-4 px-4 text-muted-foreground font-semibold">%</th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Liga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Award className="w-5 h-5 text-primary" />}
                            <span className="font-bold text-foreground">{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-foreground">{team.name}</span>
                        </td>
                        <td className="py-4 px-4 text-center text-foreground">
                          {getGamesPlayed(team.wins, team.losses)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-foreground">{team.wins}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-foreground">{team.losses}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-primary">
                            {getWinPercentage(team.wins, team.losses)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {getLeagueName(team.league_id)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {teams.map((team, index) => (
                  <Card key={team.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Award className="w-6 h-6 text-primary" />}
                        <span className="text-2xl font-bold text-foreground">#{index + 1}</span>
                        <h3 className="text-lg font-bold text-foreground">{team.name}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">PJ</p>
                        <p className="text-lg font-bold text-foreground">
                          {getGamesPlayed(team.wins, team.losses)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">V</p>
                        <p className="text-lg font-bold text-green-500">{team.wins}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">D</p>
                        <p className="text-lg font-bold text-red-500">{team.losses}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {getLeagueName(team.league_id)}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {getWinPercentage(team.wins, team.losses)}%
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Standings;
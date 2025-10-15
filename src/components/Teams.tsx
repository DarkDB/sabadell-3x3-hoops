import { useState, useEffect } from "react";
import { Users2, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
}

const Teams = () => {
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data: teamsData, count } = await supabase
      .from("teams")
      .select("*", { count: "exact" })
      .order("wins", { ascending: false })
      .limit(4);

    if (teamsData) {
      setFeaturedTeams(teamsData);
      setTotalTeams(count || 0);
      // Estimamos 4 jugadores por equipo para el total
      setTotalPlayers((count || 0) * 4);
    }
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  return (
    <section id="teams" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Equipos & <span className="text-primary">Jugadores</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce a los equipos que dominan la cancha y luchan por la gloria
          </p>
        </div>

        {/* Featured Teams */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredTeams.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No hay equipos registrados</p>
            </div>
          ) : (
            featuredTeams.map((team, index) => (
              <div
                key={team.id}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-glow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users2 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-card-foreground">{team.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Victorias</span>
                    <span className="font-bold text-card-foreground">{team.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Derrotas</span>
                    <span className="font-bold text-card-foreground">{team.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% Victoria</span>
                    <span className="font-bold text-primary">{getWinPercentage(team.wins, team.losses)}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <Trophy className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">{totalTeams}</div>
            <div className="text-sm text-primary-foreground/90">Equipos Activos</div>
          </div>
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <Users2 className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">{totalPlayers}+</div>
            <div className="text-sm text-primary-foreground/90">Jugadores Registrados</div>
          </div>
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <TrendingUp className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">{getWinPercentage(featuredTeams.reduce((acc, t) => acc + t.wins, 0), featuredTeams.reduce((acc, t) => acc + t.losses, 0))}%</div>
            <div className="text-sm text-primary-foreground/90">Participación</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Teams;

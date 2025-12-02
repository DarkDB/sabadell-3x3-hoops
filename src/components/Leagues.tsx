import { useState, useEffect } from "react";
import { Trophy, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface League {
  id: string;
  name: string;
  description: string | null;
  season: string | null;
  start_date: string | null;
  end_date: string | null;
  age_category: string | null;
  gender: string | null;
}

const Leagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    const { data: leaguesData } = await supabase
      .from("leagues")
      .select("*")
      .order("created_at", { ascending: false });

    if (leaguesData) {
      setLeagues(leaguesData);
      
      // Fetch team counts for each league
      const counts: Record<string, number> = {};
      for (const league of leaguesData) {
        const { count } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("league_id", league.id);
        counts[league.id] = count || 0;
      }
      setTeamCounts(counts);
    }
  };

  const getIcon = (index: number) => {
    const icons = [Trophy, Users, Calendar];
    return icons[index % icons.length];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <section id="leagues" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-card-foreground">
            Nuestras <span className="text-primary">Ligas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra la competición perfecta para tu nivel y demuestra tu talento en la cancha
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {leagues.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No hay ligas disponibles</p>
            </div>
          ) : (
            leagues.map((league, index) => {
              const Icon = getIcon(index);
              const details = [];
              
              if (league.age_category) {
                details.push(`${league.age_category}`);
              }
              
              if (league.gender) {
                details.push(`${league.gender}`);
              }
              
              if (teamCounts[league.id]) {
                details.push(`${teamCounts[league.id]} equipos`);
              }
              
              if (league.season) {
                details.push(`Temporada ${league.season}`);
              }
              
              if (league.start_date && league.end_date) {
                details.push(`${formatDate(league.start_date)} - ${formatDate(league.end_date)}`);
              }
              
              return (
                <Card
                  key={league.id}
                  className="bg-background border-border hover:border-primary transition-all duration-300 hover:shadow-glow hover:-translate-y-2 group"
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {league.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {league.description || "Liga competitiva de baloncesto 3x3"}
                    </p>
                    {details.length > 0 && (
                      <ul className="space-y-2">
                        {details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Leagues;

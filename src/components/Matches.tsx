import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Matches = () => {
  const upcomingMatches = [
    {
      date: "15 Oct 2025",
      time: "18:00",
      team1: "Thunder Squad",
      team2: "Street Kings",
      location: "Polideportivo Can Rull",
      status: "Próximo",
    },
    {
      date: "16 Oct 2025",
      time: "19:30",
      team1: "Urban Warriors",
      team2: "Fast Break",
      location: "Polideportivo Can Rull",
      status: "Próximo",
    },
  ];

  const recentResults = [
    {
      date: "8 Oct 2025",
      team1: "Thunder Squad",
      score1: 21,
      team2: "Urban Warriors",
      score2: 18,
    },
    {
      date: "8 Oct 2025",
      team1: "Street Kings",
      score1: 21,
      team2: "Fast Break",
      score2: 15,
    },
  ];

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
              {upcomingMatches.map((match, index) => (
                <Card key={index} className="bg-background border-border hover:border-primary transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        {match.status}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {match.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-foreground">{match.team1}</div>
                      <div className="text-primary font-black">VS</div>
                      <div className="text-lg font-bold text-foreground">{match.team2}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {match.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-card-foreground">Resultados Recientes</h3>
            <div className="space-y-4">
              {recentResults.map((result, index) => (
                <Card key={index} className="bg-background border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {result.date}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <div className="text-lg font-bold text-foreground mb-2">{result.team1}</div>
                        <div className={`text-4xl font-black ${result.score1 > result.score2 ? 'text-primary' : 'text-muted-foreground'}`}>
                          {result.score1}
                        </div>
                      </div>
                      <div className="px-6 text-muted-foreground font-bold">-</div>
                      <div className="flex-1 text-center">
                        <div className="text-lg font-bold text-foreground mb-2">{result.team2}</div>
                        <div className={`text-4xl font-black ${result.score2 > result.score1 ? 'text-primary' : 'text-muted-foreground'}`}>
                          {result.score2}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Matches;

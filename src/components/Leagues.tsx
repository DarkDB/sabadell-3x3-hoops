import { Trophy, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leagues = () => {
  const leagues = [
    {
      title: "Liga Principal",
      description: "Competición de alto nivel para equipos experimentados",
      icon: Trophy,
      details: ["8 equipos", "Formato round-robin", "Playoffs finales"],
    },
    {
      title: "Liga Amateur",
      description: "Perfecta para equipos que empiezan en el 3x3",
      icon: Users,
      details: ["10 equipos", "Dos divisiones", "Ascenso disponible"],
    },
    {
      title: "Liga de Verano",
      description: "Torneo especial durante los meses de verano",
      icon: Calendar,
      details: ["Formato abierto", "Partidos semanales", "Ambiente festivo"],
    },
  ];

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
          {leagues.map((league, index) => {
            const Icon = league.icon;
            return (
              <Card
                key={index}
                className="bg-background border-border hover:border-primary transition-all duration-300 hover:shadow-glow hover:-translate-y-2 group"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {league.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{league.description}</p>
                  <ul className="space-y-2">
                    {league.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leagues;

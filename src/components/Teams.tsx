import { Users2, Trophy, TrendingUp } from "lucide-react";

const Teams = () => {
  const featuredTeams = [
    {
      name: "Thunder Squad",
      wins: 8,
      losses: 2,
      points: 245,
    },
    {
      name: "Street Kings",
      wins: 7,
      losses: 3,
      points: 238,
    },
    {
      name: "Urban Warriors",
      wins: 6,
      losses: 4,
      points: 221,
    },
    {
      name: "Fast Break",
      wins: 5,
      losses: 5,
      points: 215,
    },
  ];

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
          {featuredTeams.map((team, index) => (
            <div
              key={index}
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
                  <span className="text-muted-foreground">Puntos</span>
                  <span className="font-bold text-primary">{team.points}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <Trophy className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">12</div>
            <div className="text-sm text-primary-foreground/90">Equipos Activos</div>
          </div>
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <Users2 className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">48</div>
            <div className="text-sm text-primary-foreground/90">Jugadores Registrados</div>
          </div>
          <div className="text-center p-6 bg-gradient-primary rounded-lg shadow-glow">
            <TrendingUp className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
            <div className="text-3xl font-black text-primary-foreground mb-2">95%</div>
            <div className="text-sm text-primary-foreground/90">Participación</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Teams;

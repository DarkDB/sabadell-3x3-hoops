import { Newspaper, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Community = () => {
  const news = [
    {
      title: "¡Nueva temporada confirmada!",
      date: "12 Oct 2025",
      excerpt: "La próxima temporada arranca en enero 2026 con más equipos y premios mejorados.",
      icon: Star,
    },
    {
      title: "Thunder Squad domina la liga",
      date: "10 Oct 2025",
      excerpt: "Con 8 victorias consecutivas, Thunder Squad se posiciona como favorito al título.",
      icon: Newspaper,
    },
    {
      title: "Jornada solidaria este sábado",
      date: "8 Oct 2025",
      excerpt: "Recaudación de fondos para equipamiento deportivo en centros juveniles.",
      icon: Heart,
    },
  ];

  return (
    <section id="community" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Nuestra <span className="text-primary">Comunidad</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Más que una liga, somos una familia unida por la pasión del baloncesto
          </p>
        </div>

        {/* News Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {news.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{item.date}</div>
                  <h3 className="text-xl font-bold mb-3 text-card-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.excerpt}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Community Values */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-glow">
          <h3 className="text-3xl md:text-4xl font-black text-primary-foreground mb-6">
            Únete a Nosotros
          </h3>
          <p className="text-lg text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            En 3lab3 creemos en la competición sana, el compañerismo y el desarrollo del talento local. 
            Cada partido es una oportunidad para crecer como jugador y como persona.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-black text-primary-foreground mb-2">Pasión</div>
              <div className="text-sm text-primary-foreground/80">Por el juego</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary-foreground mb-2">Respeto</div>
              <div className="text-sm text-primary-foreground/80">En la cancha</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary-foreground mb-2">Comunidad</div>
              <div className="text-sm text-primary-foreground/80">Siempre unidos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;

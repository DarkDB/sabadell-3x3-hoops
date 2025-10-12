import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-basketball.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter">
          <span className="text-foreground">Bienvenido a </span>
          <span className="text-primary">3lab3</span>
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-foreground">
          La Liga 3x3 de Sabadell
        </p>
        <p className="text-lg md:text-xl mb-12 text-muted-foreground max-w-2xl mx-auto">
          Pasión, competición y comunidad en el baloncesto amateur más emocionante de la ciudad
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => scrollToSection("registration")}
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Inscribe tu equipo
          </Button>
          <Button
            onClick={() => scrollToSection("leagues")}
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Ver ligas
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">12+</div>
            <div className="text-sm md:text-base text-muted-foreground">Equipos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">50+</div>
            <div className="text-sm md:text-base text-muted-foreground">Jugadores</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-primary mb-2">100+</div>
            <div className="text-sm md:text-base text-muted-foreground">Partidos</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

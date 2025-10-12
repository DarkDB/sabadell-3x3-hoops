import { Target, Heart, Zap } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Sobre <span className="text-primary">3lab3</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Organizadores oficiales de la liga 3x3 más vibrante de Sabadell
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Nuestra Misión</h3>
              <p className="text-muted-foreground">
                Promover el baloncesto 3x3 como herramienta de desarrollo deportivo y social en Sabadell
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Nuestros Valores</h3>
              <p className="text-muted-foreground">
                Competición justa, respeto mutuo, inclusión y pasión por el deporte
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Nuestra Energía</h3>
              <p className="text-muted-foreground">
                Dinamismo urbano, cultura de calle y la intensidad del baloncesto 3x3
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 md:p-12 border border-border">
            <h3 className="text-2xl font-bold mb-6 text-card-foreground">Nuestra Historia</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                3lab3 nació en 2022 con la visión de crear un espacio donde el talento local pudiera brillar. 
                Inspirados por el movimiento mundial del baloncesto 3x3 y la cultura FIBA, decidimos traer 
                esta emocionante modalidad a las canchas de Sabadell.
              </p>
              <p>
                Desde entonces, hemos crecido hasta convertirnos en la liga de referencia de baloncesto 3x3 
                en la ciudad, con más de 50 jugadores activos, múltiples equipos compitiendo y una comunidad 
                apasionada que sigue creciendo temporada tras temporada.
              </p>
              <p>
                Nuestro compromiso es seguir ofreciendo competición de calidad, fomentar el fair play y 
                construir una comunidad unida por el amor al baloncesto.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="font-bold mb-4 text-card-foreground">¿Por qué 3x3?</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2"></div>
                  <span>Rápido, dinámico y espectacular</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2"></div>
                  <span>Formato olímpico reconocido por FIBA</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2"></div>
                  <span>Perfecto para jugadores amateur y profesionales</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2"></div>
                  <span>Cultura urbana y accesible para todos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

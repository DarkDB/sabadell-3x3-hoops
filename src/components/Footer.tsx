import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-3xl font-black mb-4">
              <span className="text-primary">3</span>
              <span className="text-foreground">lab</span>
              <span className="text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La liga 3x3 más emocionante de Sabadell. Competición, pasión y comunidad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("leagues")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Ligas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("teams")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Equipos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("matches")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Partidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("registration")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Inscripción
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                info@3lab3.com
              </li>
              <li>+34 600 000 000</li>
              <li>Sabadell, Barcelona</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 3lab3. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const navItems = [
    { label: "Inicio", id: "hero" },
    { label: "Ligas", id: "leagues" },
    { label: "Equipos", id: "teams" },
    { label: "Partidos", id: "matches" },
    { label: "Comunidad", id: "community" },
    { label: "Inscripción", id: "registration" },
    { label: "Sobre nosotros", id: "about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-black tracking-tighter">
            <span className="text-primary">3</span>
            <span className="text-foreground">lab</span>
            <span className="text-primary">3</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("registration")}
              className="ml-4 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              Inscríbete
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-muted/20 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 pt-4">
              <Button
                onClick={() => scrollToSection("registration")}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Inscríbete
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

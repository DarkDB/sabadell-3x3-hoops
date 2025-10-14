import { useState, useEffect } from "react";
import { Menu, X, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            {user ? (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="ml-2 border-border"
              >
                <User className="w-4 h-4 mr-2" />
                Admin
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="ml-2 border-border"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Ingresar
              </Button>
            )}
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
            <div className="px-4 pt-4 space-y-2">
              <Button
                onClick={() => scrollToSection("registration")}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Inscríbete
              </Button>
              {user ? (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="w-full border-border"
                >
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="w-full border-border"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

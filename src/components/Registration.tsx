import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Mail, Phone, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
interface League {
  id: string;
  name: string;
  season: string | null;
}

const Registration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    players: "",
    leagueId: "",
    message: "",
  });

  useEffect(() => {
    checkAuth();
    fetchLeagues();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  };

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from("leagues")
      .select("id, name, season")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leagues:", error);
      return;
    }
    setLeagues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = formData.email.trim().toLowerCase();
    const playersNum = parseInt(formData.players);

    if (!z.string().email().safeParse(targetEmail).success) {
      toast.error("Email inválido");
      return;
    }

    if (!formData.leagueId) {
      toast.error("Debes seleccionar una liga");
      return;
    }

    if (!playersNum || playersNum < 3 || playersNum > 6) {
      toast.error("El número de jugadores debe estar entre 3 y 6");
      return;
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      let currentUser = user;
      const needsNewAccount = !currentUser || (currentUser.email?.toLowerCase() !== targetEmail);

      if (needsNewAccount) {
        if (currentUser && currentUser.email?.toLowerCase() !== targetEmail) {
          await supabase.auth.signOut();
          setUser(null);
        }

        let passwordToUse = formData.password?.trim();
        let generatedTemp = false;

        if (!passwordToUse) {
          passwordToUse = Math.random().toString(36).slice(-10) + "aA1!";
          generatedTemp = true;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: targetEmail,
          password: passwordToUse,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: formData.captainName },
          },
        });

        if (signUpError && !signUpError.message.toLowerCase().includes("registered")) {
          throw signUpError;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: passwordToUse,
        });

        if (signInError || !signInData.user) {
          toast.error("No se pudo iniciar sesión. Si ya tienes cuenta, entra desde 'Acceder'.");
          navigate("/auth");
          return;
        }

        currentUser = signInData.user;
        setUser(currentUser);

        if (generatedTemp) {
          toast.info(`Contraseña temporal: ${passwordToUse}`, { duration: 12000 });
        }
      }

      const { error: insertError } = await supabase.from("team_registrations").insert({
        user_id: currentUser.id,
        team_name: formData.teamName,
        captain_name: formData.captainName,
        email: targetEmail,
        phone: formData.phone,
        league_id: formData.leagueId,
        number_of_players: playersNum,
        message: formData.message,
      });

      if (insertError) {
        console.error("Error al insertar registro:", insertError);
        throw insertError;
      }

      // Enviar email de confirmación de registro
      try {
        const { data: leagueData } = await supabase
          .from("leagues")
          .select("name")
          .eq("id", formData.leagueId)
          .single();

        await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            to: targetEmail,
            captainName: formData.captainName,
            teamName: formData.teamName,
            leagueName: leagueData?.name || "Liga",
            numberOfPlayers: playersNum,
            totalAmount: 80,
          },
        });
      } catch (emailError) {
        console.error("Error sending registration email:", emailError);
      }

      toast.success("¡Equipo registrado! Te llevamos a tu dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (error: any) {
      console.error("Error en el registro:", error);
      toast.error(error.message || "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="registration" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-card-foreground">
              <span className="text-primary">Inscripción</span> de Equipos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ¿Listo para demostrar tu nivel? Inscribe tu equipo y únete a la competición
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-background rounded-xl p-8 border border-border shadow-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="teamName" className="text-foreground">Nombre del Equipo</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="Ej: Thunder Squad"
                  />
                </div>

                <div>
                  <Label htmlFor="captainName" className="text-foreground">Nombre del Capitán</Label>
                  <Input
                    id="captainName"
                    name="captainName"
                    value={formData.captainName}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Credenciales para nueva cuenta (si aplica) */}
                <div>
                  <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="Crea una contraseña segura"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="Repite la contraseña"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="leagueId" className="text-foreground">Liga</Label>
                  <Select
                    value={formData.leagueId}
                    onValueChange={(value) => setFormData({ ...formData, leagueId: value })}
                    required
                  >
                    <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                      <SelectValue placeholder="Selecciona una liga" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name} {league.season ? `- ${league.season}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="players" className="text-foreground">Número de Jugadores</Label>
                  <Input
                    id="players"
                    name="players"
                    type="number"
                    min="3"
                    max="6"
                    value={formData.players}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="Mínimo 3, máximo 6"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground">Mensaje (opcional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-2 bg-muted border-border text-foreground"
                    placeholder="¿Algo que quieras contarnos?"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Inscribir Equipo"}
                </Button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-gradient-primary rounded-xl p-8 shadow-glow">
                <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                  Requisitos de Inscripción
                </h3>
                <ul className="space-y-3 text-primary-foreground/90">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full mr-3 mt-2"></div>
                    <span>Equipo de 3-6 jugadores (3 titulares + suplentes)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full mr-3 mt-2"></div>
                    <span>Edad mínima: 16 años</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full mr-3 mt-2"></div>
                    <span>Cuota de inscripción: 80€ por equipo</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full mr-3 mt-2"></div>
                    <span>Seguro deportivo incluido</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-6 border border-border text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-black text-foreground">12</div>
                  <div className="text-sm text-muted-foreground">Plazas Disponibles</div>
                </div>
                <div className="bg-background rounded-lg p-6 border border-border text-center">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-black text-foreground">500€</div>
                  <div className="text-sm text-muted-foreground">Premio 1er Puesto</div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 border border-border">
                <h4 className="font-bold text-foreground mb-3 flex items-center">
                  <Mail className="w-5 h-5 text-primary mr-2" />
                  Contacto
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Email: info@3lab3.com
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="w-4 h-4 text-primary mr-2" />
                  +34 600 000 000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;

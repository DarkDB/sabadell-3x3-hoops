import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Mail, Phone, Trophy } from "lucide-react";

const Registration = () => {
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    email: "",
    phone: "",
    players: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Inscripción recibida! Nos pondremos en contacto pronto.");
    setFormData({
      teamName: "",
      captainName: "",
      email: "",
      phone: "",
      players: "",
      message: "",
    });
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
                >
                  Inscribir Equipo
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

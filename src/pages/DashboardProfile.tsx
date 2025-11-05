import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TeamRegistration {
  id: string;
  team_name: string;
  captain_name: string;
  email: string;
  phone: string;
}

const DashboardProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registration, setRegistration] = useState<TeamRegistration | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const [profileData, regData] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("team_registrations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profileData.data) {
      setProfile(profileData.data);
      setFullName(profileData.data.full_name || "");
    }

    if (regData.data) {
      setRegistration(regData.data);
    }

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados",
      });
      setProfile({ ...profile, full_name: fullName.trim() || null });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Mi Perfil</h2>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Actualiza tus datos de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>

        {registration && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Equipo</CardTitle>
              <CardDescription>
                Datos de registro de tu equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre del Equipo</p>
                <p className="font-medium">{registration.team_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capitán</p>
                <p className="font-medium">{registration.captain_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{registration.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{registration.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardProfile;

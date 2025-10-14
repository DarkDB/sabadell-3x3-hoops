import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import AdminLeagues from "@/components/admin/AdminLeagues";
import AdminTeams from "@/components/admin/AdminTeams";
import AdminMatches from "@/components/admin/AdminMatches";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      checkAdminRole(user.id);
    } else if (loading) {
      setLoading(false);
      navigate("/auth");
    }
  }, [user, navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (error) throw error;

      setIsAdmin(!!data);
      setLoading(false);

      if (!data) {
        toast.error("No tienes permisos de administrador");
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error verificando permisos");
      navigate("/");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Cargando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black">
                <span className="text-primary">3</span>
                <span className="text-card-foreground">lab</span>
                <span className="text-primary">3</span>
                <span className="text-card-foreground ml-2">Admin</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="leagues" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="leagues">Ligas</TabsTrigger>
            <TabsTrigger value="teams">Equipos</TabsTrigger>
            <TabsTrigger value="matches">Partidos</TabsTrigger>
          </TabsList>

          <TabsContent value="leagues">
            <AdminLeagues />
          </TabsContent>

          <TabsContent value="teams">
            <AdminTeams />
          </TabsContent>

          <TabsContent value="matches">
            <AdminMatches />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

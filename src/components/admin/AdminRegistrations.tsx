import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Registration {
  id: string;
  team_name: string;
  captain_name: string;
  email: string;
  phone: string;
  number_of_players: number;
  payment_status: string;
  created_at: string;
  league_id: string;
  leagues: {
    name: string;
    season: string | null;
  };
  players: { id: string }[];
}

const AdminRegistrations = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("team_registrations")
        .select(
          `
          *,
          leagues (
            name,
            season
          ),
          players (
            id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("team_registrations")
        .update({ payment_status: status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "El estado de pago ha sido actualizado",
      });

      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approveAndCreateTeam = async (reg: Registration) => {
    if (reg.payment_status !== "paid") {
      toast({
        title: "Error",
        description: "El pago debe estar confirmado antes de crear el equipo",
        variant: "destructive",
      });
      return;
    }

    if (reg.players.length !== reg.number_of_players) {
      toast({
        title: "Error",
        description: `El equipo debe tener ${reg.number_of_players} jugadores registrados`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear equipo oficial
      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: reg.team_name,
          league_id: reg.league_id,
          wins: 0,
          losses: 0,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Enviar email de aprobación
      try {
        await supabase.functions.invoke('send-approval-email', {
          body: {
            to: reg.email,
            captainName: reg.captain_name,
            teamName: reg.team_name,
            leagueName: reg.leagues?.name || "Liga",
          },
        });
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
      }

      toast({
        title: "¡Equipo creado!",
        description: `${reg.team_name} ahora es un equipo oficial en la liga`,
      });

      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      paid: "default",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      paid: "Pagado",
      rejected: "Rechazado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando registros...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Equipos</CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay registros aún
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Capitán</TableHead>
                  <TableHead>Liga</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Jugadores</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Aprobar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.team_name}</TableCell>
                    <TableCell>{reg.captain_name}</TableCell>
                    <TableCell>
                      {reg.leagues.name}
                      {reg.leagues.season && (
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          - {reg.leagues.season}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reg.email}</div>
                        <div className="text-muted-foreground">{reg.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reg.players.length} / {reg.number_of_players}
                    </TableCell>
                    <TableCell>{getStatusBadge(reg.payment_status)}</TableCell>
                    <TableCell>
                      {new Date(reg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reg.payment_status}
                        onValueChange={(value) =>
                          updatePaymentStatus(reg.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => approveAndCreateTeam(reg)}
                        disabled={
                          reg.payment_status !== "paid" ||
                          reg.players.length !== reg.number_of_players
                        }
                        className="bg-gradient-primary"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Crear Equipo
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRegistrations;

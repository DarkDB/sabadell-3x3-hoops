import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Match {
  id: string;
  match_date: string;
  location: string | null;
  status: string;
  home_team: { name: string };
  away_team: { name: string };
  home_score: number | null;
  away_score: number | null;
}

interface UpcomingMatchesProps {
  matches: Match[];
  teamName: string;
}

export function UpcomingMatches({ matches, teamName }: UpcomingMatchesProps) {
  const getMatchStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Programado", variant: "default" },
      in_progress: { label: "En Curso", variant: "secondary" },
      completed: { label: "Finalizado", variant: "outline" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

  const isHomeTeam = (match: Match) => match.home_team.name === teamName;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Partidos</CardTitle>
        <CardDescription>Calendario de juegos de tu equipo</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay partidos programados
          </p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const status = getMatchStatus(match.status);
              const home = isHomeTeam(match);
              
              return (
                <div
                  key={match.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(match.match_date), "PPP 'a las' p", { locale: es })}
                      </div>
                      {match.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </div>
                      )}
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${home ? "text-primary" : ""}`}>
                        {match.home_team.name}
                      </p>
                    </div>
                    <div className="px-4 text-center min-w-[80px]">
                      {match.status === "completed" ? (
                        <p className="text-lg font-bold">
                          {match.home_score} - {match.away_score}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">vs</p>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`font-medium ${!home ? "text-primary" : ""}`}>
                        {match.away_team.name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

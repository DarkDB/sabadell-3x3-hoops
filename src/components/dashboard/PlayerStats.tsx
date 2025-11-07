import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users2, Trophy, Target } from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: string | null;
  jersey_number: number | null;
}

interface PlayerStatsProps {
  players: Player[];
}

const PlayerStats = ({ players }: PlayerStatsProps) => {
  // Aggregate stats by position
  const positionData = players.reduce((acc, player) => {
    const position = player.position || "Sin posición";
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(positionData).map(([name, value]) => ({
    name,
    cantidad: value,
  }));

  // Jersey number distribution
  const jerseyDistribution = players
    .filter(p => p.jersey_number !== null)
    .map(p => ({
      nombre: p.name.split(' ')[0], // First name only
      numero: p.jersey_number,
    }))
    .sort((a, b) => (a.numero || 0) - (b.numero || 0))
    .slice(0, 8); // Top 8 for better visualization

  const COLORS = ['hsl(25 100% 50%)', 'hsl(25 80% 45%)', 'hsl(25 60% 40%)', 'hsl(25 40% 35%)'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <Users2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jugadores</p>
              <p className="text-2xl font-bold text-foreground">{players.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Posiciones</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(positionData).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Con Número</p>
              <p className="text-2xl font-bold text-foreground">
                {players.filter(p => p.jersey_number !== null).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Position Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">Distribución por Posición</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(25 100% 50%)"
                  dataKey="cantidad"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 95%)', 
                    border: '1px solid hsl(0 0% 30%)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de posiciones
            </div>
          )}
        </Card>

        {/* Jersey Numbers */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">Números de Camiseta</h3>
          {jerseyDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jerseyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 30%)" />
                <XAxis 
                  dataKey="nombre" 
                  stroke="hsl(0 0% 70%)"
                  tick={{ fill: 'hsl(0 0% 70%)' }}
                />
                <YAxis 
                  stroke="hsl(0 0% 70%)"
                  tick={{ fill: 'hsl(0 0% 70%)' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 95%)', 
                    border: '1px solid hsl(0 0% 30%)',
                    borderRadius: '8px',
                    color: 'hsl(0 0% 0%)'
                  }}
                />
                <Bar dataKey="numero" fill="hsl(25 100% 50%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de números de camiseta
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PlayerStats;
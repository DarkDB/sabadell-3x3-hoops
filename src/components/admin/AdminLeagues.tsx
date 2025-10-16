import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface League {
  id: string;
  name: string;
  description: string;
  season: string;
  start_date: string;
  end_date: string;
}

const AdminLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar ligas");
    } else {
      setLeagues(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("leagues")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast.error("Error al actualizar liga");
      } else {
        toast.success("Liga actualizada");
        resetForm();
        fetchLeagues();
      }
    } else {
      const { error } = await supabase.from("leagues").insert([formData]);

      if (error) {
        toast.error("Error al crear liga");
      } else {
        toast.success("Liga creada");
        resetForm();
        fetchLeagues();
      }
    }
  };

  const handleEdit = (league: League) => {
    setEditingId(league.id);
    setFormData({
      name: league.name,
      description: league.description,
      season: league.season,
      start_date: league.start_date,
      end_date: league.end_date,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta liga?")) return;

    const { error } = await supabase.from("leagues").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar liga");
    } else {
      toast.success("Liga eliminada");
      fetchLeagues();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      season: "",
      start_date: "",
      end_date: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">
          {editingId ? "Editar Liga" : "Nueva Liga"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season">Temporada</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="bg-gradient-primary">
              {editingId ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingId ? "Actualizar" : "Crear"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="border-border">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ligas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {leagues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay ligas registradas aún
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Temporada</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell className="font-medium">{league.name}</TableCell>
                      <TableCell>{league.description}</TableCell>
                      <TableCell>{league.season}</TableCell>
                      <TableCell>{new Date(league.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(league.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(league)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(league.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeagues;

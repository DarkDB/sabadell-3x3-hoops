import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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

      <div className="space-y-4">
        {leagues.map((league) => (
          <Card key={league.id} className="p-4 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-card-foreground">{league.name}</h3>
                <p className="text-muted-foreground text-sm">{league.description}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Temporada:</span> {league.season} | 
                  <span className="font-medium ml-2">Fechas:</span> {league.start_date} - {league.end_date}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(league)}
                  className="border-border"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(league.id)}
                  className="border-border text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLeagues;

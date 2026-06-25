import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, GripVertical, Trash2, Save, Clock, Waves } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/competicoes/$id/provas")({
  head: () => ({
    meta: [
      { title: "Provas da Competição — AquaFlow" },
      { name: "description", content: "Gerencie as provas e sua ordem na competição." },
    ],
  }),
  component: ProvasCompeticao,
});

interface Prova {
  id: string;
  ordem: number;
  estilo: string;
  distancia: string;
  categoria: string;
  genero: string;
  indice: string;
  raias: number;
}

const estilos = [
  "Livre",
  "Peito",
  "Costas",
  "Borboleta",
  "Medley",
  "Revezamento Livre",
  "Revezamento Medley",
];

const distancias = ["25m", "50m", "100m", "200m", "400m", "800m", "1500m"];

const categorias = ["Infantil", "Juvenil", "Júnior", "Adulto", "Master"];

function ProvasCompeticao() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  
  const [provas, setProvas] = useState<Prova[]>([
    { id: "1", ordem: 1, estilo: "Livre", distancia: "50m", categoria: "Adulto", genero: "Masculino", indice: "00:25.00", raias: 8 },
    { id: "2", ordem: 2, estilo: "Livre", distancia: "50m", categoria: "Adulto", genero: "Feminino", indice: "00:28.00", raias: 8 },
    { id: "3", ordem: 3, estilo: "Peito", distancia: "50m", categoria: "Adulto", genero: "Masculino", indice: "00:30.00", raias: 8 },
  ]);

  const [novaProva, setNovaProva] = useState({
    estilo: "",
    distancia: "",
    categoria: "",
    genero: "",
    indice: "",
    raias: 8,
  });

  const handleAddProva = () => {
    if (!novaProva.estilo || !novaProva.distancia || !novaProva.categoria || !novaProva.genero) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const newProva: Prova = {
      id: Date.now().toString(),
      ordem: provas.length + 1,
      estilo: novaProva.estilo,
      distancia: novaProva.distancia,
      categoria: novaProva.categoria,
      genero: novaProva.genero,
      indice: novaProva.indice || "00:00.00",
      raias: novaProva.raias,
    };

    setProvas([...provas, newProva]);
    setNovaProva({ estilo: "", distancia: "", categoria: "", genero: "", indice: "", raias: 8 });
    toast.success("Prova adicionada com sucesso!");
  };

  const handleRemoveProva = (id: string) => {
    setProvas((prev: Prova[]) => prev.filter((p: Prova) => p.id !== id));
    toast.success("Prova removida.");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newProvas = [...provas];
    [newProvas[index], newProvas[index - 1]] = [newProvas[index - 1], newProvas[index]];
    newProvas.forEach((p, i) => p.ordem = i + 1);
    setProvas(newProvas);
  };

  const handleMoveDown = (index: number) => {
    if (index === provas.length - 1) return;
    const newProvas = [...provas];
    [newProvas[index], newProvas[index + 1]] = [newProvas[index + 1], newProvas[index]];
    newProvas.forEach((p, i) => p.ordem = i + 1);
    setProvas(newProvas);
  };

  const handleSave = () => {
    toast.success("Ordem das provas salva com sucesso!");
    navigate({ to: "/competicoes/$id/gerenciar", params: { id } });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Provas da Competição"
        description="Configure as provas e defina a ordem de disputa."
        action={
          <Button asChild variant="ghost">
            <Link to="/competicoes/$id/gerenciar" params={{ id }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Lista de Provas */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Ordem das Provas</h3>
            
            {provas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma prova adicionada ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {provas.map((prova, index) => (
                  <div
                    key={prova.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/10"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {prova.ordem}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {prova.distancia} {prova.estilo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prova.categoria} · {prova.genero}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{prova.indice}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Waves className="h-3 w-3" />
                      <span>{prova.raias} raias</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === provas.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveProva(prova.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar Ordem
            </Button>
          </div>
        </div>

        {/* Formulário para Adicionar Prova */}
        <Card className="p-5 h-fit">
          <h3 className="font-semibold text-foreground mb-4">Adicionar Nova Prova</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estilo *</Label>
              <Select value={novaProva.estilo} onValueChange={(value) => setNovaProva({ ...novaProva, estilo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {estilos.map((estilo) => (
                    <SelectItem key={estilo} value={estilo}>{estilo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Distância *</Label>
              <Select value={novaProva.distancia} onValueChange={(value) => setNovaProva({ ...novaProva, distancia: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {distancias.map((distancia) => (
                    <SelectItem key={distancia} value={distancia}>{distancia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoria *</Label>
              <Select value={novaProva.categoria} onValueChange={(value) => setNovaProva({ ...novaProva, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Gênero *</Label>
              <Select value={novaProva.genero} onValueChange={(value) => setNovaProva({ ...novaProva, genero: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Índice de Qualificação</Label>
              <Input
                placeholder="00:00.00"
                value={novaProva.indice}
                onChange={(e) => setNovaProva({ ...novaProva, indice: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Número de Raias</Label>
              <Input
                type="number"
                min={4}
                max={10}
                value={novaProva.raias}
                onChange={(e) => setNovaProva({ ...novaProva, raias: parseInt(e.target.value) || 8 })}
              />
            </div>

            <Button onClick={handleAddProva} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Prova
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

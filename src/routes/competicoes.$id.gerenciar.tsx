import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Trophy,
  Save,
  ChevronLeft,
  ChevronRight,
  Lock,
  Waves,
  MapPin,
  Calendar,
  GripVertical,
  Shuffle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { competitions } from "@/lib/data";
import { useRBAC } from "@/lib/rbac";

export const Route = createFileRoute("/competicoes/$id/gerenciar")({
  head: () => ({
    meta: [
      { title: "Gerenciar Competição — AquaFlow" },
      { name: "description", content: "Painel de gestão da competição: provas, resultados e relatórios." },
    ],
  }),
  loader: ({ params }) => {
    const competition = competitions.find((c) => c.id === params.id);
    if (!competition) throw notFound();
    return { competition };
  },
  component: GerenciarCompeticao,
  notFoundComponent: () => (
    <AppLayout>
      <p className="text-muted-foreground">Competição não encontrada.</p>
    </AppLayout>
  ),
});

const provasList = [
  { num: "001", nome: "50m Livre F.", classe: "Pré-Mirim", series: "1/1" },
  { num: "002", nome: "50m Livre M.", classe: "Pré-Mirim", series: "2/2" },
  { num: "003", nome: "100m Livre F.", classe: "Mirim/Petiz", series: "4/4" },
  { num: "004", nome: "100m Livre M.", classe: "Mirim/Petiz", series: "4/4" },
  { num: "005", nome: "50m Costas F.", classe: "Pré-Mirim", series: "1/1" },
  { num: "006", nome: "50m Costas M.", classe: "Pré-Mirim", series: "1/1" },
];

interface Lane {
  raia: number;
  atleta: string;
  clube: string;
  nasc: string;
  inscricao: string;
  resultado: string;
}

const initialLanes: Lane[] = [
  { raia: 1, atleta: "Layane dos Anjos", clube: "Lazer & Saúde", nasc: "2018", inscricao: "NT", resultado: "1:02.75" },
  { raia: 2, atleta: "Beatriz M. Barbosa", clube: "Wellness", nasc: "2020", inscricao: "38.55", resultado: "38.75" },
  { raia: 3, atleta: "Rebeca S. Machado", clube: "Lazer & Saúde", nasc: "2018", inscricao: "25.31", resultado: "" },
  { raia: 4, atleta: "Helena M. Landim", clube: "Complexo Inspirar", nasc: "2018", inscricao: "29.21", resultado: "28.78" },
  { raia: 5, atleta: "Ana Liz S. Monteiro", clube: "Lazer & Saúde", nasc: "2018", inscricao: "NT", resultado: "45.25" },
  { raia: 6, atleta: "Melissa M. G. Salles", clube: "Wellness", nasc: "2018", inscricao: "NT", resultado: "23.97" },
];

function rank(lanes: Lane[]) {
  const timed = lanes
    .filter((l) => l.resultado && /\d/.test(l.resultado))
    .map((l) => ({
      raia: l.raia,
      secs: parseTime(l.resultado),
    }))
    .sort((a, b) => a.secs - b.secs);
  const map = new Map<number, number>();
  timed.forEach((t, i) => map.set(t.raia, i + 1));
  return map;
}

function parseTime(t: string): number {
  const m = t.match(/(?:(\d+):)?(\d+)\.(\d+)/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const min = m[1] ? parseInt(m[1], 10) : 0;
  return min * 60 + parseInt(m[2], 10) + parseInt(m[3], 10) / 100;
}

const POINTS: Record<number, number> = { 1: 9, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 };

function GerenciarCompeticao() {
  const { canEnterResults } = useRBAC();
  const { competition } = Route.useLoaderData();
  const [selected, setSelected] = useState(provasList[2]);
  const [lanes, setLanes] = useState<Lane[]>(initialLanes);
  const [editMode, setEditMode] = useState<"results" | "lanes">("results");

  const ranking = rank(lanes);

  const updateResult = (raia: number, value: string) => {
    if (!canEnterResults) {
      toast.error("Acesso Negado: Seu perfil atual não tem permissão para editar tempos.");
      return;
    }
    setLanes((prev) =>
      prev.map((l) => (l.raia === raia ? { ...l, resultado: value } : l)),
    );
  };

  const shuffleLanes = () => {
    if (!canEnterResults) {
      toast.error("Acesso Negado: Seu perfil atual não tem permissão para editar raias.");
      return;
    }
    const shuffled = [...lanes].sort(() => Math.random() - 0.5);
    const updated = shuffled.map((lane, index) => ({ ...lane, raia: index + 1 }));
    setLanes(updated);
    toast.success("Raias sorteadas aleatoriamente!");
  };

  const moveLane = (fromIndex: number, toIndex: number) => {
    if (!canEnterResults) {
      toast.error("Acesso Negado: Seu perfil atual não tem permissão para editar raias.");
      return;
    }
    const newLanes = [...lanes];
    const [moved] = newLanes.splice(fromIndex, 1);
    newLanes.splice(toIndex, 0, moved);
    const updated = newLanes.map((lane, index) => ({ ...lane, raia: index + 1 }));
    setLanes(updated);
  };

  return (
    <AppLayout>
      {/* Event header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-primary px-5 py-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link to="/competicoes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Competições
            </Link>
          </Button>
          <div className="leading-tight text-white">
            <p className="text-sm font-bold">{competition.nome}</p>
            <p className="flex items-center gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(competition.dataInicio).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Waves className="h-3 w-3" /> {competition.piscina}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {competition.cidade}/{competition.estado}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => toast.success("Relatório PDF gerado")}>
            <FileText className="mr-2 h-4 w-4" /> Relatório PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.success("Planilha exportada")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Provas list */}
        <Card className="h-fit overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Provas da Etapa
            </p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {provasList.map((p) => (
              <button
                key={p.num}
                onClick={() => setSelected(p)}
                className={`flex w-full items-center justify-between gap-2 border-b border-border px-4 py-3 text-left transition-colors ${
                  selected.num === p.num ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{p.num}</p>
                  <p className="text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{p.classe}</p>
                </div>
                <Badge variant="secondary">{p.series}</Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Results entry */}
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{selected.nome}</h2>
                <Badge>{selected.classe}</Badge>
                <Badge variant="secondary">Final Direta</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Prova {selected.num} · {selected.series} séries · {lanes.length} atletas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              <div className="flex gap-2">
                <Button
                  variant={editMode === "results" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode("results")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Resultados
                </Button>
                <Button
                  variant={editMode === "lanes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode("lanes")}
                >
                  <Waves className="mr-2 h-4 w-4" /> Raias
                </Button>
              </div>
              {editMode === "results" ? (
                <Button 
                  onClick={() => toast.success("Resultados computados e salvos")}
                  disabled={!canEnterResults}
                >
                  <Save className="mr-2 h-4 w-4" /> Computar Resultados
                </Button>
              ) : (
                <Button 
                  onClick={shuffleLanes}
                  disabled={!canEnterResults}
                >
                  <Shuffle className="mr-2 h-4 w-4" /> Sortear Raias
                </Button>
              )}
            </div>
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Raia / Atleta</th>
                  <th className="px-3 py-3">Nasc.</th>
                  <th className="px-3 py-3">Inscrição</th>
                  {editMode === "results" && (
                    <>
                      <th className="px-3 py-3">Resultado</th>
                      <th className="px-3 py-3">Col.</th>
                      <th className="px-3 py-3">Pts.</th>
                    </>
                  )}
                  {editMode === "lanes" && (
                    <th className="px-3 py-3 text-center">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {lanes.map((l, index) => {
                  const pos = ranking.get(l.raia);
                  return (
                    <tr key={l.raia} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {editMode === "lanes" && (
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          )}
                          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-bold">
                            {l.raia}
                          </span>
                          <div>
                            <p className="font-medium">{l.atleta}</p>
                            <p className="text-xs text-muted-foreground">{l.clube}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{l.nasc}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{l.inscricao}</td>
                      {editMode === "results" && (
                        <>
                          <td className="px-3 py-3">
                            <Input
                              value={l.resultado}
                              onChange={(e) => updateResult(l.raia, e.target.value)}
                              placeholder={canEnterResults ? "0:00.00" : "S/ tempo"}
                              disabled={!canEnterResults}
                              className="h-9 w-28 tabular-nums bg-card disabled:opacity-85"
                            />
                          </td>
                          <td className="px-3 py-3">
                            {pos ? (
                              <Badge variant={pos <= 3 ? "default" : "secondary"}>{pos}º</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 font-semibold tabular-nums">
                            {pos ? (POINTS[pos] ?? 0).toFixed(2) : "—"}
                          </td>
                        </>
                      )}
                      {editMode === "lanes" && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => moveLane(index, index - 1)}
                              disabled={index === 0 || !canEnterResults}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => moveLane(index, index + 1)}
                              disabled={index === lanes.length - 1 || !canEnterResults}
                            >
                              ↓
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Súmula de balizamento gerada e enviada para a mesa")}>
              <FileText className="mr-2 h-4 w-4" /> Súmula da Prova
            </Button>
            <Button variant="outline" onClick={() => toast.success("Boletim de classificação geral gerado")}>
              <Trophy className="mr-2 h-4 w-4" /> Classificação Geral
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.success("Prova homologada com sucesso! Resultados publicados.")}
              disabled={!canEnterResults}
            >
              <Lock className="mr-2 h-4 w-4" /> Homologar Prova
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

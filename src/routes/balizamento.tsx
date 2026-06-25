import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Shuffle,
  Users,
  Timer,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  Award,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/balizamento")({
  head: () => ({
    meta: [
      { title: "Balizamento Automático — AquaFlow" },
      { name: "description", content: "Módulo de balizamento automático FINA/World Aquatics com Circle Seeding." },
    ],
  }),
  component: BalizamentoManager,
});

interface BalizadoSwimmer {
  id: string;
  atleta: string;
  clube: string;
  tempo: string;
  raia: number;
  serie: number;
  status: "Confirmado" | "Scratch" | "DNS";
}

const initialSwimmers: BalizadoSwimmer[] = [
  // Serie 3 (Fastest - Last Heat)
  { id: "s-1", atleta: "João Silva", clube: "Minas TC", tempo: "00:48.21", raia: 4, serie: 3, status: "Confirmado" },
  { id: "s-2", atleta: "Mariana Costa", clube: "Minas TC", tempo: "00:51.45", raia: 5, serie: 3, status: "Confirmado" },
  { id: "s-3", atleta: "Thiago Santos", clube: "GNU", tempo: "00:52.40", raia: 3, serie: 3, status: "Confirmado" },
  { id: "s-4", atleta: "Matheus Lima", clube: "Praia Clube", tempo: "00:53.10", raia: 6, serie: 3, status: "Confirmado" },
  { id: "s-5", atleta: "Bruno Castro", clube: "SESI-SP", tempo: "00:53.90", raia: 2, serie: 3, status: "Confirmado" },
  { id: "s-6", atleta: "Rodrigo Melo", clube: "Pinheiros", tempo: "00:54.80", raia: 7, serie: 3, status: "Confirmado" },
  // Serie 2 (Second-to-last Heat)
  { id: "s-7", atleta: "Pedro Alencar", clube: "SESI-SP", tempo: "00:49.12", raia: 4, serie: 2, status: "Confirmado" },
  { id: "s-8", atleta: "Lucas Ferreira", clube: "Flamengo", tempo: "00:51.87", raia: 5, serie: 2, status: "Confirmado" },
  { id: "s-9", atleta: "Gustavo Lima", clube: "Pinheiros", tempo: "00:52.98", raia: 3, serie: 2, status: "Confirmado" },
  { id: "s-10", atleta: "Felipe Souza", clube: "GNU", tempo: "00:53.45", raia: 6, serie: 2, status: "Confirmado" },
  { id: "s-11", atleta: "Carlos Santos", clube: "Lazer & Saúde", tempo: "00:54.10", raia: 2, serie: 2, status: "Confirmado" },
  { id: "s-12", atleta: "André Albuquerque", clube: "Wellness", tempo: "00:55.20", raia: 7, serie: 2, status: "Confirmado" },
];

function BalizamentoManager() {
  const { role, canEnterResults } = useRBAC();
  const [swimmers, setSwimmers] = useState<BalizadoSwimmer[]>(initialSwimmers);
  const [selectedEvent, setSelectedEvent] = useState("100m Livre Masculino");
  const [selectedPhase, setSelectedPhase] = useState("Eliminatórias");
  
  // Swim-off modal state
  const [isSwimOffOpen, setIsSwimOffOpen] = useState(false);
  const [swimOffAthlete1, setSwimOffAthlete1] = useState("Matheus Lima");
  const [swimOffAthlete2, setSwimOffAthlete2] = useState("Felipe Souza");

  // Substitution modal state
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [selectedTargetSwimmer, setSelectedTargetSwimmer] = useState<BalizadoSwimmer | null>(null);
  const [subName, setSubName] = useState("");
  const [subClube, setSubClube] = useState("");

  const handleScratchSwimmer = (id: string) => {
    setSwimmers(swimmers.map(s => s.id === id ? { ...s, status: "Scratch" } : s));
    toast.warning("Atleta retirado da série (Scratch/DNS)!");
  };

  const handleOpenSubstitution = (swimmer: BalizadoSwimmer) => {
    setSelectedTargetSwimmer(swimmer);
    setSubName("");
    setSubClube("");
    setIsSubOpen(true);
  };

  const handleSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetSwimmer || !subName) return;

    setSwimmers(swimmers.map(s => 
      s.id === selectedTargetSwimmer.id 
        ? { ...s, atleta: subName, clube: subClube || "Avulso", status: "Confirmado" } 
        : s
    ));
    setIsSubOpen(false);
    toast.success(`Substituição efetuada! ${subName} agora está na raia ${selectedTargetSwimmer.raia} (Série ${selectedTargetSwimmer.serie}).`);
  };

  const handleRunRebalizamento = () => {
    toast.info("Processando balizamento automático (Circle Seeding World Aquatics)...");
    
    // Sort active swimmers by time (ascending)
    const active = swimmers.filter(s => s.status === "Confirmado");
    
    // Circle seeding order for 2 heats:
    // Heat 3: 1st (raia 4), 3rd (raia 5), 5th (raia 3), 7th (raia 6), 9th (raia 2), 11th (raia 7)
    // Heat 2: 2nd (raia 4), 4th (raia 5), 6th (raia 3), 8th (raia 6), 10th (raia 2), 12th (raia 7)
    
    const laneDistribution = [4, 5, 3, 6, 2, 7, 1, 8];
    const reseeded = [...active].sort((a, b) => a.tempo.localeCompare(b.tempo)).map((s, idx) => {
      const heat = idx % 2 === 0 ? 3 : 2;
      const indexInHeat = Math.floor(idx / 2);
      const lane = laneDistribution[indexInHeat % laneDistribution.length];
      return { ...s, serie: heat, raia: lane };
    });

    // Combine with scratched swimmers
    const scratched = swimmers.filter(s => s.status !== "Confirmado");
    setSwimmers([...reseeded, ...scratched]);
    toast.success("Balizamento gerado e alinhado de acordo com as regras FINA!");
  };

  const handleSimulateSwimOff = () => {
    toast.success(`Swim-off programado entre ${swimOffAthlete1} e ${swimOffAthlete2}!`);
    setIsSwimOffOpen(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Balizamento FINA / World Aquatics"
        description="Módulo de balizamento automático de séries, distribuição de raias FINA e simulação de desempate (Swim-Off)."
        action={
          role !== "Público" && (
            <div className="flex gap-2">
              <Dialog open={isSwimOffOpen} onOpenChange={setIsSwimOffOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Timer className="mr-2 h-4 w-4" /> Swim-Off (Desempate)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerar Swim-Off de Desempate</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); handleSimulateSwimOff(); }} className="space-y-4 pt-4 text-xs">
                    <div className="space-y-2">
                      <Label>Competidores Empatados (Vaga para Final)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={swimOffAthlete1} onChange={(e) => setSwimOffAthlete1(e.target.value)} placeholder="Atleta 1" />
                        <Input value={swimOffAthlete2} onChange={(e) => setSwimOffAthlete2(e.target.value)} placeholder="Atleta 2" />
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[11px] text-muted-foreground flex gap-2">
                      <AlertCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      De acordo com o regulamento World Aquatics, o desempate para a 8ª ou 16ª vaga será resolvido em uma prova direta de Swim-Off em raias adjacentes (4 e 5).
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsSwimOffOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Iniciar Série Especial</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button onClick={handleRunRebalizamento}>
                <Shuffle className="mr-2 h-4 w-4" /> Rebalizar Séries
              </Button>
            </div>
          )
        }
      />

      {/* Settings Selector */}
      <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3.5 mb-5 text-xs">
        <div className="flex items-center gap-1.5">
          <Label className="font-semibold text-muted-foreground">Prova:</Label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="rounded border border-border bg-card px-2 py-1 text-foreground focus:outline-none"
          >
            <option value="100m Livre Masculino">100m Livre Masculino</option>
            <option value="50m Borboleta Feminino">50m Borboleta Feminino</option>
            <option value="200m Medley Masculino">200m Medley Masculino</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <Label className="font-semibold text-muted-foreground">Etapa/Fase:</Label>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="rounded border border-border bg-card px-2 py-1 text-foreground focus:outline-none"
          >
            <option value="Eliminatórias">Eliminatórias (Circle Seeding)</option>
            <option value="Semifinal">Semifinal (Balizamento Ziguezague)</option>
            <option value="Final">Final (Seeding Padrão)</option>
          </select>
        </div>

        <Badge variant="outline" className="border-primary/20 text-sky-400 font-bold ml-auto">
          World Aquatics Seeded
        </Badge>
      </Card>

      {/* Wizard Dialog for Substitution */}
      <Dialog open={isSubOpen} onOpenChange={setIsSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substituição de Atleta na Raia {selectedTargetSwimmer?.raia}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubstitution} className="space-y-4 pt-4 text-xs">
            <div className="space-y-1">
              <Label>Atleta Substituto (Nome Completo)</Label>
              <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Ex: Lucas Pimenta" />
            </div>
            <div className="space-y-1">
              <Label>Clube</Label>
              <Input value={subClube} onChange={(e) => setSubClube(e.target.value)} placeholder="Ex: Flamengo" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsSubOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Efetuar Substituição</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Heats Visualizer */}
      <div className="space-y-6">
        {[3, 2].map((heatNum) => {
          const heatSwimmers = swimmers.filter(s => s.serie === heatNum).sort((a, b) => a.raia - b.raia);
          return (
            <Card key={heatNum} className="border-border/40 p-5">
              <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6.5 w-6.5 items-center justify-center rounded bg-primary text-xs font-bold text-white">
                    S{heatNum}
                  </span>
                  <h3 className="font-bold text-foreground text-sm">
                    Série {heatNum} de {selectedPhase === "Eliminatórias" ? "3 (Séries Fortes - Circle Seeded)" : "1"}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Filtro FINA: Raia 4 = 1º tempo
                </Badge>
              </div>

              {/* Lane Distribution Grid */}
              <div className="grid gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((laneNum) => {
                  const swimmer = heatSwimmers.find(s => s.raia === laneNum);
                  return (
                    <div
                      key={laneNum}
                      className={`flex flex-wrap items-center gap-3.5 rounded-lg border px-4 py-2.5 text-xs ${
                        swimmer && swimmer.status === "Confirmado"
                          ? "border-border/50 bg-card hover:bg-muted/10"
                          : swimmer && swimmer.status === "Scratch"
                          ? "border-destructive/20 bg-destructive/5 opacity-55"
                          : "border-dashed border-border/40 bg-muted/5 italic"
                      }`}
                    >
                      {/* Lane Badge */}
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary text-sm font-bold text-white">
                        {laneNum}
                      </span>

                      {swimmer ? (
                        <>
                          <div className="flex-1 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{swimmer.atleta}</span>
                              {swimmer.status !== "Confirmado" && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1">{swimmer.status}</Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{swimmer.clube}</p>
                          </div>

                          <div className="flex items-center gap-4.5">
                            <span className="font-mono font-bold text-sky-400 tabular-nums">{swimmer.tempo}</span>
                            
                            {role !== "Público" && swimmer.status === "Confirmado" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenSubstitution(swimmer)}
                                >
                                  Substituir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleScratchSwimmer(swimmer.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 text-muted-foreground">
                          Raia Vazia (Sem atletas balizados)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}

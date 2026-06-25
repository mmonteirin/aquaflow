import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Timer,
  Play,
  Square,
  Activity,
  Cpu,
  Radio,
  Clock,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/cronometragem")({
  head: () => ({
    meta: [
      { title: "Cronometragem Eletrônica — AquaFlow" },
      { name: "description", content: "Integração e simulação de placas de cronometragem Omega e Colorado em tempo real." },
    ],
  }),
  component: CronometragemManager,
});

interface TimingLane {
  raia: number;
  atleta: string;
  reacao: string;
  split50m: string;
  oficial: string;
  earlyTakeoff: boolean;
  status: "Ready" | "Racing" | "Finished" | "DQ";
  targetTime: number; // in seconds
}

const initialLanes: TimingLane[] = [
  { raia: 1, atleta: "Rodrigo Melo", reacao: "0.68", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 54.12 },
  { raia: 2, atleta: "Bruno Castro", reacao: "0.71", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 52.88 },
  { raia: 3, atleta: "Lucas Ferreira", reacao: "0.64", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 51.10 },
  { raia: 4, atleta: "João Silva", reacao: "0.58", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 48.21 },
  { raia: 5, atleta: "Pedro Alencar", reacao: "0.62", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 49.34 },
  { raia: 6, atleta: "Matheus Lima", reacao: "0.67", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 52.12 },
  { raia: 7, atleta: "Thiago Santos", reacao: "-0.03", split50m: "", oficial: "", earlyTakeoff: true, status: "DQ", targetTime: 53.40 }, // false start!
  { raia: 8, atleta: "Gustavo Lima", reacao: "0.72", split50m: "", oficial: "", earlyTakeoff: false, status: "Ready", targetTime: 53.99 }
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function CronometragemManager() {
  const { role, canEnterResults } = useRBAC();
  const [vendor, setVendor] = useState("Omega Quantum");
  const [lanes, setLanes] = useState<TimingLane[]>(initialLanes);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRace = () => {
    if (running) return;

    setRunning(true);
    setTime(0);
    // Reset lanes
    setLanes(
      initialLanes.map((l) => ({
        ...l,
        split50m: "",
        oficial: "",
        status: l.earlyTakeoff ? "DQ" : "Racing",
      }))
    );

    toast.success("Partida dada! Sinal eletrônico disparado.");

    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTime(elapsed);

      // Dynamic split and finish updates
      setLanes((prev) =>
        prev.map((l) => {
          if (l.status === "DQ") return l;

          let updated = { ...l };
          
          // Split at 25s mark
          if (elapsed >= 25 && !l.split50m) {
            const splitVal = (l.targetTime / 2 + (Math.random() - 0.5)).toFixed(2);
            updated.split50m = splitVal;
          }

          // Finish when elapsed exceeds targetTime
          if (elapsed >= l.targetTime && l.status === "Racing") {
            updated.oficial = formatTime(l.targetTime);
            updated.status = "Finished";
          }

          return updated;
        })
      );
    }, 10) as any;
  };

  const handleStopRace = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    toast.info("Cronometragem pausada manualmente.");
  };

  const handleResetRace = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setTime(0);
    setLanes(initialLanes);
    toast.success("Placa de tempos reiniciada.");
  };

  const handleManualOverride = (raia: number, timeVal: string) => {
    if (!canEnterResults) {
      toast.error("Permissão de operador de cronometragem requerida.");
      return;
    }
    setLanes(
      lanes.map((l) => (l.raia === raia ? { ...l, oficial: timeVal, status: "Finished" } : l))
    );
    toast.success(`Tempo manual computado para a Raia ${raia}: ${timeVal}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Painel de Cronometragem Eletrônica"
        description="Monitoramento e recepção de sinais das placas de toque oficiais das raias (Omega, Colorado)."
      />

      {/* Integration Status bar */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-4 border-primary/20 bg-primary/5 flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary" />
          <div className="text-xs">
            <span className="text-muted-foreground block font-medium">Equipamento Conectado</span>
            <select
              value={vendor}
              onChange={(e) => {
                setVendor(e.target.value);
                toast.success(`Hardware alterado para: ${e.target.value}`);
              }}
              className="border-0 bg-transparent py-0.5 pl-0 pr-6 text-xs font-bold text-foreground focus:outline-none focus:ring-0"
            >
              <option value="Omega Quantum">Omega Quantum (FINA Standard)</option>
              <option value="Colorado System 6">Colorado Time Systems 6</option>
              <option value="Daktronics OmniSport">Daktronics OmniSport 2000</option>
              <option value="Swiss Timing ARES21">Swiss Timing ARES 21</option>
            </select>
          </div>
        </Card>

        <Card className="p-4 border-success/20 bg-success/5 flex items-center gap-3">
          <Radio className="h-6 w-6 text-success animate-pulse" />
          <div className="text-xs">
            <span className="text-muted-foreground block font-medium">Canal de Comunicação</span>
            <span className="font-bold text-success flex items-center gap-1 mt-1">
              PORTA COM3: Ativa · 9600 bps
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 flex items-center gap-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
          <div className="text-xs">
            <span className="text-muted-foreground block font-medium">Atraso de Bloco (Relay Takeoff)</span>
            <span className="font-bold text-foreground">Sensibilidade 0.02s</span>
          </div>
        </Card>
      </div>

      {/* Race Runner Screen */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Race list */}
        <div className="space-y-4">
          <Card className="p-5 border-border/40 bg-card/60">
            {/* Run clock */}
            <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-4">
              <div>
                <Badge variant="outline" className="text-sky-400 border-primary/20">
                  Série 4 · 100m Livre Masculino
                </Badge>
                <h3 className="font-bold text-foreground text-sm mt-1">Status: {running ? "PROVA EM ANDAMENTO" : "PRONTO PARA PARTIDA"}</h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                  {formatTime(time)}
                </span>
              </div>
            </div>

            {/* Run controls */}
            {role !== "Público" && (
              <div className="flex gap-2 mb-4">
                <Button onClick={handleStartRace} disabled={running} className="flex-1">
                  <Play className="mr-1.5 h-4 w-4" /> Iniciar Prova Simulada
                </Button>
                <Button onClick={handleStopRace} disabled={!running} variant="outline" className="flex-1">
                  <Square className="mr-1.5 h-4 w-4" /> Pausar
                </Button>
                <Button onClick={handleResetRace} variant="ghost" className="flex-1">
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                </Button>
              </div>
            )}

            {/* Lane list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/20">
                    <th className="px-4 py-2.5">Raia</th>
                    <th className="px-4 py-2.5">Competidor</th>
                    <th className="px-4 py-2.5 text-center">Tempo Reação</th>
                    <th className="px-4 py-2.5 text-center">Split 50m</th>
                    <th className="px-4 py-2.5">Tempo Oficial</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lanes.map((l) => (
                    <tr key={l.raia} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-xs font-bold text-foreground">
                          {l.raia}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{l.atleta}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs tabular-nums">
                        {l.reacao.startsWith("-") ? (
                          <span className="text-destructive font-bold flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> {l.reacao}
                          </span>
                        ) : (
                          <span className="text-success font-medium">{l.reacao}s</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs tabular-nums">
                        {l.split50m ? `${l.split50m}s` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-sky-400 tabular-nums">
                        {running && l.status === "Racing" ? (
                          <span className="animate-pulse">CORRENDO...</span>
                        ) : (
                          l.oficial || "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            l.status === "Finished"
                              ? "bg-success/15 border-success/35 text-success"
                              : l.status === "DQ"
                              ? "bg-destructive/15 border-destructive/35 text-destructive"
                              : "bg-slate-800 text-slate-400"
                          }
                          variant="outline"
                        >
                          {l.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Contingency fallback and logs */}
        <div className="space-y-4">
          <Card className="p-5 border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4.5 w-4.5 text-warning" />
              <h4 className="text-sm font-bold">Contingência / Substituição Manual</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-normal mb-3">
              Em caso de falha da placa de toque eletrônica, o operador técnico da federação pode digitar e computar tempos manuais a partir dos cronômetros de backup.
            </p>
            {canEnterResults ? (
              <div className="space-y-2">
                {[4, 5].map((raia) => {
                  const laneData = lanes.find((l) => l.raia === raia);
                  return (
                    <div key={raia} className="flex items-center justify-between rounded border border-border p-2 bg-muted/10">
                      <span className="text-xs font-semibold">Raia {raia} ({laneData?.atleta.split(" ")[0]})</span>
                      <Input
                        placeholder="0:49.20"
                        className="h-8 w-24 text-xs font-mono tabular-nums bg-card border-border/60"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleManualOverride(raia, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-destructive/5 border border-destructive/20 text-destructive text-[11px] p-2.5 rounded">
                Seu perfil atual não possui acesso para computação manual.
              </div>
            )}
          </Card>

          <Card className="p-5 border-border/40">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Sinais e Alertas Recentes
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Raia 4: Toque registrado às 10:18:24</span>
              </div>
              <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="font-bold text-destructive">Raia 7: Saída Antecipada (-0.03s) detectada!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="text-muted-foreground">Sinal de disparo eletrônico recebido da pistola.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

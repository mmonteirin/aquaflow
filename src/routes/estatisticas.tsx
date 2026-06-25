import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  Users,
  Compass,
  Zap,
  Activity,
  Award,
  ChevronRight,
  User,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { athletes } from "@/lib/data";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas Avançadas — AquaFlow" },
      { name: "description", content: "Módulo analítico de evolução de tempos de natação, gráficos de performance e comparativo Head-to-Head." },
    ],
  }),
  component: EstatisticasManager,
});

// Mock historic times for evolution charts
const joaoSilvaEvolution = [
  { competicao: "Estadual 2024", tempo: 50.12, pontos: 820 },
  { competicao: "Finkel 2024", tempo: 49.55, pontos: 850 },
  { competicao: "Estadual 2025", tempo: 48.90, pontos: 880 },
  { competicao: "Troféu Brasil 2026", tempo: 48.21, pontos: 910 },
];

const pedroAlencarEvolution = [
  { competicao: "Estadual 2024", tempo: 51.40, pontos: 780 },
  { competicao: "Finkel 2024", tempo: 50.80, pontos: 805 },
  { competicao: "Estadual 2025", tempo: 49.95, pontos: 835 },
  { competicao: "Troféu Brasil 2026", tempo: 49.34, pontos: 865 },
];

// Head-to-head split comparison data
const splitComparison = [
  { name: "Reação (Saída)", joao: 0.58, pedro: 0.62 },
  { name: "Split 25m", joao: 10.45, pedro: 10.98 },
  { name: "Split 50m (Turn)", joao: 22.81, pedro: 23.40 },
  { name: "Split 75m", joao: 35.10, pedro: 36.12 },
  { name: "Final 100m", joao: 48.21, pedro: 49.34 },
];

function EstatisticasManager() {
  const [athleteId1, setAthleteId1] = useState("1"); // João Silva
  const [athleteId2, setAthleteId2] = useState("2"); // Pedro Alencar

  const a1 = athletes.find((a) => a.id === athleteId1) || athletes[0];
  const a2 = athletes.find((a) => a.id === athleteId2) || athletes[1];

  // Map evolution data
  const chartData = joaoSilvaEvolution.map((item, idx) => ({
    competicao: item.competicao,
    "João Silva (s)": item.tempo,
    "Pedro Alencar (s)": pedroAlencarEvolution[idx]?.tempo || null,
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Estatísticas & Analytics Avançado"
        description="Área analítica esportiva inspirada no World Aquatics Stats. Evolução cronométrica e head-to-head."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Head-to-Head Comparison Picker */}
        <Card className="p-5 border-border/40 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4 border-b border-border/20 pb-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Comparador de Performance (Head-to-Head)</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-center">
            {/* Athlete 1 Selector */}
            <div className="lg:col-span-2 flex flex-col items-center text-center p-4 border border-border/40 bg-muted/10 rounded-xl">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={a1.foto} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <h4 className="mt-2 font-bold text-sm text-foreground">{a1.nome}</h4>
              <p className="text-[10px] text-muted-foreground">{a1.clube}</p>
              
              <div className="mt-4 w-full">
                <Label className="text-[10px] text-muted-foreground block text-left">Selecionar Nadador 1</Label>
                <select
                  value={athleteId1}
                  onChange={(e) => setAthleteId1(e.target.value)}
                  className="w-full mt-1.5 rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8 focus:outline-none"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Comparison Chart */}
            <div className="lg:col-span-3 flex flex-col items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Telemetria de Passagem (Splits em Segundos)
              </span>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={splitComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#112a4d" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{
                      background: "#0b1d3a",
                      border: "1px solid #112a4d",
                      borderRadius: 8,
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="joao" name={a1.nome.split(" ")[0]} fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pedro" name={a2.nome.split(" ")[0]} fill="#38bdf8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Athlete 2 Selector */}
            <div className="lg:col-span-2 flex flex-col items-center text-center p-4 border border-border/40 bg-muted/10 rounded-xl">
              <Avatar className="h-16 w-16 border-2 border-sky-400">
                <AvatarImage src={a2.foto} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <h4 className="mt-2 font-bold text-sm text-foreground">{a2.nome}</h4>
              <p className="text-[10px] text-muted-foreground">{a2.clube}</p>
              
              <div className="mt-4 w-full">
                <Label className="text-[10px] text-muted-foreground block text-left">Selecionar Nadador 2</Label>
                <select
                  value={athleteId2}
                  onChange={(e) => setAthleteId2(e.target.value)}
                  className="w-full mt-1.5 rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8 focus:outline-none"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Evolution Chart */}
        <Card className="p-5 border-border/40 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-border/20 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-sm font-bold text-foreground">Curva de Desempenho Histórico (100m Livre)</h3>
            </div>
            <Badge variant="outline" className="text-sky-400 border-primary/20">Progressão Anual</Badge>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#112a4d" vertical={false} />
              <XAxis dataKey="competicao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[47, 53]} />
              <Tooltip
                contentStyle={{
                  background: "#0b1d3a",
                  border: "1px solid #112a4d",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="João Silva (s)" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Pedro Alencar (s)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Stats breakdowns Card */}
        <Card className="p-5 border-border/40 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-3">
            <Compass className="h-5 w-5 text-warning" />
            <h3 className="text-sm font-bold text-foreground">Métricas Técnicas Consolidadas</h3>
          </div>
          
          <div className="space-y-4 text-xs leading-normal">
            <div className="rounded-lg bg-muted/20 border border-border p-3.5 space-y-2">
              <span className="font-semibold text-foreground block">Velocidade Crítica (CSS):</span>
              <div className="flex justify-between text-slate-300">
                <span>João Silva:</span>
                <span className="font-bold">1.04 m/s</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Pedro Alencar:</span>
                <span className="font-bold">0.98 m/s</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/20 border border-border p-3.5 space-y-2">
              <span className="font-semibold text-foreground block">Tempo de Reação Médio (Largada):</span>
              <div className="flex justify-between text-slate-300">
                <span>João Silva:</span>
                <span className="font-bold text-success">0.58s (Elite)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Pedro Alencar:</span>
                <span className="font-bold text-warning">0.62s (Excelente)</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/20 border border-border p-3.5 space-y-2">
              <span className="font-semibold text-foreground block">Análise de Virada (T-50m):</span>
              <p className="text-[10px] text-muted-foreground">João Silva retém 92% da velocidade de entrada na parede, comparado a 89% de Pedro Alencar.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

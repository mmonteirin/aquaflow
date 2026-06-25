import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  Building2,
  Waves,
  Award,
  ShieldAlert,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRBAC } from "@/lib/rbac";
import {
  competitions,
  results,
  athletes,
  clubs,
  officials,
  records,
  protests,
  financialTransactions,
  participationByClub,
  enrollmentByCategory,
  enrollmentTrend,
  rankings,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Executivo — AquaFlow" },
      {
        name: "description",
        content: "Painel executivo com estatísticas em tempo real, rankings e controle de competições.",
      },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["#2563eb", "#38bdf8", "#1e3a5f", "#22c55e", "#f59e0b"];

function Dashboard() {
  const { role, canViewFinances } = useRBAC();

  // Compute stats from mock tables
  const activeCompetitions = competitions.filter((c) => c.status === "Em andamento" || c.status === "Inscrições abertas").length;
  const registeredAthletes = athletes.length;
  const activeClubs = clubs.filter((c) => c.situacao === "Ativo").length;
  const federationsCount = 27; // mock representation (one per state)
  const activeOfficials = officials.filter((o) => o.elegivel).length;
  const approvedRecords = records.length;
  const openEnrollments = competitions.filter((c) => c.status === "Inscrições abertas").length;

  // Filter alerts / pendencies based on role
  const pendingClubs = clubs.filter((c) => c.situacao === "Pendente" || c.situacao === "Suspenso");
  const openProtests = protests.filter((p) => p.status === "Aberto" || p.status === "Em análise");
  const pendingTransactions = financialTransactions.filter((t) => t.status === "Pendente");

  return (
    <AppLayout>
      {/* Premium Hero Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-primary p-6 shadow-lg shadow-primary/10 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-foreground/20 text-white border-0">
                PRO EDITION
              </Badge>
              <span className="flex items-center gap-1 text-[11px] font-bold text-sky-300">
                <Clock className="h-3 w-3 animate-pulse" /> Sincronizado Colorado Timing
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              AquaFlow Executive
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Painel integrado de alta performance para natação competitiva. Monitorando competições, homologações e registros em tempo real.
            </p>
          </div>
          <div className="rounded-lg bg-black/25 p-3.5 backdrop-blur text-right leading-tight border border-white/15">
            <p className="text-xs font-semibold text-slate-300">Perfil Ativo</p>
            <p className="text-lg font-bold text-white mt-0.5">{role}</p>
            <p className="text-[10px] text-sky-400 font-semibold mt-1">
              {role === "Super Admin" ? "Acesso Irrestrito" : "Acesso Limitado"}
            </p>
          </div>
        </div>
      </div>

      <PageHeader
        title="Dashboard Geral"
        description="Painel nacional unificado da confederação esportiva aquática."
      />

      {/* Real-time KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard label="Comp. Ativas" value={activeCompetitions} delta="+1 esta semana" icon={Trophy} />
        <StatCard label="Atletas Reg." value={registeredAthletes} delta="+4 novos hoje" icon={Users} />
        <StatCard label="Clubes Ativos" value={activeClubs} delta="+1 homologado" icon={Building2} />
        <StatCard label="Federações" value={federationsCount} delta="Todas UFs" icon={Activity} />
        <StatCard label="Árbitros Ativos" value={activeOfficials} delta="100% elegíveis" icon={UserCheck} />
        <StatCard label="Recordes Homol." value={approvedRecords} delta="+2 novos este mês" icon={Award} />
        <StatCard label="Inscrições Abertas" value={openEnrollments} delta="3 encerrando" icon={Waves} />
      </div>

      {/* Charts Panel */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Participação por Clube</h3>
            <Badge variant="outline" className="text-muted-foreground">Troféu Brasil</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={participationByClub}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {participationByClub.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0b1d3a",
                  border: "1px solid #112a4d",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Inscrições por Categoria</h3>
            <Badge variant="outline" className="text-muted-foreground">Ano Corrente</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollmentByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#112a4d" vertical={false} />
              <XAxis dataKey="categoria" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#112a4d44" }}
                contentStyle={{
                  background: "#0b1d3a",
                  border: "1px solid #112a4d",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
              />
              <Bar dataKey="inscricoes" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Evolução Anual de Inscrições</h3>
            <span className="flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="h-3 w-3" /> +25% Crescimento
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#112a4d" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b1d3a",
                  border: "1px solid #112a4d",
                  borderRadius: 8,
                  color: "#f8fafc",
                }}
              />
              <Line type="monotone" dataKey="inscricoes" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Widgets & Tables */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Próximas Competições */}
        <Card className="p-5 lg:col-span-2 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Próximas Competições</h3>
              <p className="text-xs text-muted-foreground">Calendário oficial de eventos nacionais e estaduais</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/competicoes">Ver Tudo <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-4">
            {competitions.slice(0, 3).map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === "Inscrições abertas" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">{c.tipo}</span>
                  </div>
                  <h4 className="mt-1.5 text-sm font-semibold text-foreground">{c.nome}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.cidade}/{c.estado} · Piscina {c.piscina} ({c.raias} raias)</p>
                </div>
                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/competicoes/${c.id}/gerenciar`}>Gerenciar</Link>
                  </Button>
                  {c.status === "Inscrições abertas" && (
                    <Button size="sm" asChild>
                      <Link to="/inscricoes">Inscrever</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Top Swimmers / Rankings */}
        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Top Rankings Nacionais</h3>
              <p className="text-xs text-muted-foreground">Líderes de pontuação do ranking da temporada</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rankings">Ver Tudo <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {rankings.slice(0, 5).map((r, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 p-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{r.atleta}</h4>
                    <p className="text-[11px] text-muted-foreground">{r.clube} · {r.prova}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground tabular-nums">{r.tempo}</p>
                  <Badge variant="secondary" className="text-[10px] py-0">{r.pontos} Pts</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Últimos Resultados Homologados */}
        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Últimos Resultados</h3>
              <p className="text-xs text-muted-foreground">Classificação homologada das provas concluídas</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/resultados">Boletins <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta / Clube</TableHead>
                <TableHead>Tempo Oficial</TableHead>
                <TableHead>Reação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-semibold text-sm">{r.atleta}</div>
                    <div className="text-xs text-muted-foreground">{r.clube}</div>
                  </TableCell>
                  <TableCell className="font-medium text-sm tabular-nums">{r.tempo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{r.reacao || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Aprovado" ? "default" : "destructive"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pendências & Controle Financeiro / Administrativo */}
        <Card className="p-5 border-border/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Central de Pendências</h3>
              <p className="text-xs text-muted-foreground">Ocorrências administrativas, protestos e anuidades</p>
            </div>
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-bold text-warning">
              Ação Requerida
            </span>
          </div>

          <div className="space-y-4">
            {/* Protestos */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-warning" /> Protestos pendentes
                </span>
                <Badge variant="outline">{openProtests.length} aguardando</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {openProtests.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{p.clube} - Prova {p.prova}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-sky-400 font-bold" asChild>
                      <Link to="/protestos">Avaliar</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inconsistências de Entidades / Clubes */}
            {role !== "Público" && (
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Building2 className="h-4 w-4 text-destructive" /> Regularidade de Clubes
                  </span>
                  <Badge variant="outline">{pendingClubs.length} suspensos/pendentes</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingClubs.slice(0, 2).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{c.nome} ({c.sigla})</span>
                      <span className={`font-bold ${c.situacao === "Suspenso" ? "text-destructive" : "text-warning"}`}>
                        {c.situacao}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financeiro Rápido */}
            {canViewFinances && (
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <DollarSign className="h-4 w-4 text-success" /> Pendências Financeiras (Contas a Receber)
                  </span>
                  <Badge variant="outline">{pendingTransactions.length} em aberto</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingTransactions.slice(0, 2).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{t.origem} ({t.tipo})</span>
                      <span className="font-bold text-foreground tabular-nums">
                        R$ {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

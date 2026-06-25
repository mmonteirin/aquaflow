import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileCheck,
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRBAC } from "@/lib/rbac";
import { financialTransactions as initialTransactions, FinancialTransaction } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Módulo Financeiro — AquaFlow" },
      { name: "description", content: "Painel de controle financeiro: cobrança de anuidades de clubes, taxas de inscrições e protestos." },
    ],
  }),
  component: FinanceiroManager,
});

function FinanceiroManager() {
  const { role, canViewFinances } = useRBAC();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");

  // Sums
  const paidTransactions = transactions.filter((t) => t.status === "Pago");
  const pendingTransactions = transactions.filter((t) => t.status === "Pendente");

  const totalRevenue = paidTransactions.reduce((acc, t) => acc + t.valor, 0);
  const totalPending = pendingTransactions.reduce((acc, t) => acc + t.valor, 0);
  const registrationFees = paidTransactions.filter(t => t.tipo === "Taxa Inscrição").reduce((acc, t) => acc + t.valor, 0);
  const clubAnnuities = paidTransactions.filter(t => t.tipo === "Anuidade Clube").reduce((acc, t) => acc + t.valor, 0);

  // Grouped data for chart
  const chartData = [
    { name: "Anuidades Clubes", valor: clubAnnuities },
    { name: "Inscrições", valor: registrationFees },
    { name: "Anuidades Atletas", valor: paidTransactions.filter(t => t.tipo === "Anuidade Atleta").reduce((acc, t) => acc + t.valor, 0) },
    { name: "Taxa Protesto", valor: paidTransactions.filter(t => t.tipo === "Taxa Protesto").reduce((acc, t) => acc + t.valor, 0) },
    { name: "Multas", valor: paidTransactions.filter(t => t.tipo === "Multa").reduce((acc, t) => acc + t.valor, 0) },
  ];

  const handleApprovePayment = (id: string) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: "Pago" as const } : t));
    toast.success(`Transação ${id} confirmada como PAGA!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return <Badge className="bg-success/15 border-success/35 text-success" variant="outline">Quitado</Badge>;
      case "Pendente":
        return <Badge className="bg-warning/15 border-warning/35 text-warning" variant="outline">Aberto</Badge>;
      default:
        return <Badge variant="secondary">Cancelado</Badge>;
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.origem.toLowerCase().includes(search.toLowerCase()) || t.tipo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "TODOS" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Access Denied screen
  if (!canViewFinances) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Lock className="h-12 w-12 text-destructive animate-pulse" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Acesso Restrito ao Módulo Financeiro</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Seu perfil atual ({role}) não tem privilégios para inspecionar extratos financeiros, transações e contas bancárias.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Painel Financeiro & Anuidades"
        description="Faturamento consolidado, anuidades federativas e controle de transações bancárias da modalidade."
      />

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6 text-xs">
        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Faturamento Total</span>
            <span className="font-bold text-foreground text-sm tabular-nums">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Contas a Receber</span>
            <span className="font-bold text-foreground text-sm tabular-nums">
              R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Taxas de Inscrições</span>
            <span className="font-bold text-foreground text-sm tabular-nums">
              R$ {registrationFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Anuidades Clubes</span>
            <span className="font-bold text-foreground text-sm tabular-nums">
              R$ {clubAnnuities.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left column: Transaction list */}
        <div className="space-y-4">
          <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por pagador ou tipo de taxa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none"
              >
                <option value="TODOS">Todos os status</option>
                <option value="Pago">Quitados</option>
                <option value="Pendente">Em Aberto</option>
              </select>
            </div>
          </Card>

          <Card className="overflow-x-auto border-border/40">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Cód. Transação</th>
                  <th className="px-3 py-3">Origem / Pagador</th>
                  <th className="px-3 py-3">Tipo Cobrança</th>
                  <th className="px-3 py-3">Data Fatura</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Status</th>
                  {role === "Super Admin" && <th className="px-4 py-3 text-right">Ação</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3.5 font-bold text-sky-400">{t.id}</td>
                    <td className="px-3 py-3.5 font-semibold text-foreground">{t.origem}</td>
                    <td className="px-3 py-3.5 font-medium text-xs">{t.tipo}</td>
                    <td className="px-3 py-3.5 text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-3.5 font-mono font-bold text-foreground tabular-nums">
                      R$ {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3.5">{getStatusBadge(t.status)}</td>
                    {role === "Super Admin" && (
                      <td className="px-4 py-3.5 text-right">
                        {t.status === "Pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovePayment(t.id)}
                            className="h-7 text-xs"
                          >
                            Quitar
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right column: Chart and breakdowns */}
        <div className="space-y-4">
          <Card className="p-5 border-border/40">
            <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border/20 pb-2">
              Receitas por Categoria (Gráfico)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#112a4d" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={90} />
                <Tooltip
                  cursor={{ fill: "#112a4d44" }}
                  contentStyle={{
                    background: "#0b1d3a",
                    border: "1px solid #112a4d",
                    borderRadius: 8,
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="valor" fill="#2563eb" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 border-border/40 space-y-3.5 text-xs leading-normal">
            <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border/20 pb-2.5">
              <AlertCircle className="h-4 w-4 text-warning" /> Regras de Licenciamento Financeiro
            </div>
            <p className="text-muted-foreground">
              Para estar apto a disputar campeonatos estaduais e nacionais, as seguintes regras financeiras de anuidades são aplicadas:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
              <li>
                <strong>Clubes & Academias:</strong> Anuidade no valor de R$ 1.500,00 com vencimento fixado no início da temporada. O atraso resulta em suspensão imediata da elegibilidade dos atletas.
              </li>
              <li>
                <strong>Atletas:</strong> Taxa anual de cadastro de R$ 150,00, validada no ato da filiação à federação estadual correspondente.
              </li>
              <li>
                <strong>Inscrições:</strong> O valor individual da inscrição em provas é de R$ 38,00 por prova individual.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

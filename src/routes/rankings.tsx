import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  TrendingUp,
  Search,
  Filter,
  Users,
  Building,
  Target,
  Sparkles,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRBAC } from "@/lib/rbac";
import { rankings as initialRankings } from "@/lib/data";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Ranking Nacional de Natação — AquaFlow" },
      { name: "description", content: "Tabela oficial de ranking de atletas com pontos FINA por categoria, sexo e provas." },
    ],
  }),
  component: RankingsManager,
});

interface RankingItem {
  pos: number;
  atleta: string;
  clube: string;
  prova: string;
  tempo: string;
  pontos: number;
  sexo: "M" | "F";
  categoria: string;
  federacao: string;
}

function RankingsManager() {
  const { role } = useRBAC();
  const [list] = useState<RankingItem[]>(initialRankings as RankingItem[]);
  const [search, setSearch] = useState("");
  const [filterSex, setFilterSex] = useState<string>("TODOS");
  const [filterCategory, setFilterCategory] = useState<string>("TODOS");
  const [filterStroke, setFilterStroke] = useState<string>("TODOS");

  // Filters logic
  const filteredList = list.filter((r) => {
    const matchesSearch =
      r.atleta.toLowerCase().includes(search.toLowerCase()) ||
      r.clube.toLowerCase().includes(search.toLowerCase());
    const matchesSex = filterSex === "TODOS" || r.sexo === filterSex;
    const matchesCat = filterCategory === "TODOS" || r.categoria === filterCategory;
    const matchesStroke = filterStroke === "TODOS" || r.prova.includes(filterStroke);
    return matchesSearch && matchesSex && matchesCat && matchesStroke;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Ranking Nacional de Nadadores"
        description="Rankings consolidados integrados com cálculo de pontuação FINA/World Aquatics."
      />

      {/* Highlights metrics cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6 text-xs">
        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
            <Award className="h-5 w-5 fill-yellow-500/20" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase">Líder do Ranking</span>
            <span className="font-bold text-foreground">João Silva (Minas TC)</span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Maior Índice Técnico</span>
            <span className="font-bold text-foreground">910 Pts (100m Livre M)</span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Federação Líder</span>
            <span className="font-bold text-foreground">FAM-MG (3 atletas Top 5)</span>
          </div>
        </Card>

        <Card className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Nadadores Indexados</span>
            <span className="font-bold text-foreground">1.248 Atletas</span>
          </div>
        </Card>
      </div>

      {/* Advanced Filter Bar */}
      <div className="space-y-4">
        <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar atleta ou clube no ranking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Sex filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={filterSex}
                onChange={(e) => setFilterSex(e.target.value)}
                className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none"
              >
                <option value="TODOS">Todos Gêneros</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none"
            >
              <option value="TODOS">Todas Categorias</option>
              <option value="Júnior">Júnior</option>
              <option value="Sênior">Sênior</option>
            </select>

            {/* Stroke filter */}
            <select
              value={filterStroke}
              onChange={(e) => setFilterStroke(e.target.value)}
              className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none"
            >
              <option value="TODOS">Todos os estilos</option>
              <option value="Livre">Livre (Crawl)</option>
              <option value="Costas">Costas</option>
              <option value="Peito">Peito</option>
              <option value="Borboleta">Borboleta</option>
              <option value="Medley">Medley</option>
            </select>
          </div>
        </Card>

        {/* Rankings Table */}
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3.5 text-center w-12">Pos.</th>
                <th className="px-4 py-3.5">Atleta / Clube</th>
                <th className="px-4 py-3.5">Federação</th>
                <th className="px-4 py-3.5">Prova</th>
                <th className="px-4 py-3.5 text-center">Categoria / Sexo</th>
                <th className="px-4 py-3.5">Tempo Oficial</th>
                <th className="px-4 py-3.5 text-right w-28">FINA Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((r, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3.5 text-center">
                    <span className={`flex h-6.5 w-6.5 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : idx === 1
                        ? "bg-slate-400/20 text-slate-300 border border-slate-400/30"
                        : idx === 2
                        ? "bg-amber-750/20 text-amber-600 border border-amber-700/30"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">{r.atleta}</div>
                    <div className="text-xs text-muted-foreground">{r.clube}</div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-xs text-muted-foreground">
                    {r.federacao}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{r.prova}</td>
                  <td className="px-4 py-3.5 text-center text-xs">
                    <Badge variant="outline">{r.categoria}</Badge>
                    <span className="ml-1.5 font-semibold">{r.sexo}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-sky-400 tabular-nums">
                    {r.tempo}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-foreground font-mono">
                    {r.pontos} Pts
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                    Nenhum resultado localizado para a busca selecionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AppLayout>
  );
}

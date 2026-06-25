import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Trophy,
  Award,
  Layers,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle,
  Share2,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRBAC } from "@/lib/rbac";
import { results as initialResults, rankings } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Resultados Oficiais — AquaFlow" },
      { name: "description", content: "Resultados oficiais de natação, boletins por série, sessão e classificação de clubes." },
    ],
  }),
  component: ResultadosManager,
});

interface ClubPoints {
  pos: number;
  clube: string;
  uf: string;
  ouro: number;
  prata: number;
  bronze: number;
  pontos: number;
}

const mockClubPoints: ClubPoints[] = [
  { pos: 1, clube: "Minas Tênis Clube", uf: "MG", ouro: 8, prata: 5, bronze: 4, pontos: 342 },
  { pos: 2, clube: "SESI-SP", uf: "SP", ouro: 5, prata: 6, bronze: 3, pontos: 288 },
  { pos: 3, clube: "Clube de Regatas do Flamengo", uf: "RJ", ouro: 4, prata: 3, bronze: 5, pontos: 215 },
  { pos: 4, clube: "Esporte Clube Pinheiros", uf: "SP", ouro: 2, prata: 4, bronze: 2, pontos: 178 },
  { pos: 5, clube: "Grêmio Náutico União", uf: "RS", ouro: 1, prata: 2, bronze: 3, pontos: 120 },
];

function ResultadosManager() {
  const { role } = useRBAC();
  const [viewType, setViewType] = useState<"geral" | "serie" | "clube">("geral");
  const [selectedEvent, setSelectedEvent] = useState("100m Livre Masculino");
  const [autoPublish, setAutoPublish] = useState(true);

  const handlePublish = () => {
    toast.success("Boletim de resultados oficiais publicado com sucesso no portal da CBDA!");
  };

  const handleShare = () => {
    toast.info("Link público de resultados copiado para a área de transferência!");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Resultados Instantâneos"
        description="Publicação oficial de tempos, colocações e pontuações consolidadas por clube."
        action={
          role !== "Público" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-1.5 h-4 w-4" /> Compartilhar
              </Button>
              <Button size="sm" onClick={handlePublish}>
                <CheckCircle className="mr-1.5 h-4 w-4" /> Publicar Boletim
              </Button>
            </div>
          )
        }
      />

      {/* Visual Toggles & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex rounded-lg border border-border bg-card p-1">
          <Button
            size="sm"
            variant={viewType === "geral" ? "default" : "ghost"}
            onClick={() => setViewType("geral")}
            className="text-xs"
          >
            <Trophy className="mr-1.5 h-3.5 w-3.5" /> Geral da Prova
          </Button>
          <Button
            size="sm"
            variant={viewType === "serie" ? "default" : "ghost"}
            onClick={() => setViewType("serie")}
            className="text-xs"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" /> Resultados por Série
          </Button>
          <Button
            size="sm"
            variant={viewType === "clube" ? "default" : "ghost"}
            onClick={() => setViewType("clube")}
            className="text-xs"
          >
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Classificação por Clube
          </Button>
        </div>

        {/* Filter inputs */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none h-8"
            >
              <option value="100m Livre Masculino">100m Livre Masculino</option>
              <option value="200m Medley Masculino">200m Medley Masculino</option>
              <option value="100m Borboleta Feminino">100m Borboleta Feminino</option>
              <option value="200m Peito Feminino">200m Peito Feminino</option>
            </select>
          </div>

          {role !== "Público" && (
            <div className="flex items-center gap-2 rounded border border-border bg-card/40 px-2 py-1.5 h-8">
              <input
                id="autopublish"
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="rounded border-border bg-card accent-primary"
              />
              <label htmlFor="autopublish" className="font-semibold text-muted-foreground select-none cursor-pointer">
                Publicação Automática
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Board */}
      <Card className="overflow-x-auto p-4 border-border/40">
        {viewType === "geral" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Classificação Geral Oficial — {selectedEvent} (Final)
              </h3>
              <Badge variant="outline" className="border-success/20 text-success">
                Resultados Homologados
              </Badge>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2.5 text-center w-12">Col.</th>
                  <th className="px-4 py-2.5">Competidor / Clube</th>
                  <th className="px-4 py-2.5 text-center">Tempo de Reação</th>
                  <th className="px-4 py-2.5 text-center">Parcial 50m</th>
                  <th className="px-4 py-2.5">Tempo Oficial</th>
                  <th className="px-4 py-2.5 text-center">Recorde</th>
                  <th className="px-4 py-2.5 text-center">Fina Pts</th>
                </tr>
              </thead>
              <tbody>
                {initialResults.map((r, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3.5 text-center">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        r.colocacao === 1
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                          : r.colocacao === 2
                          ? "bg-slate-400/20 text-slate-300 border border-slate-400/30"
                          : r.colocacao === 3
                          ? "bg-amber-750/20 text-amber-600 border border-amber-700/30"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {r.colocacao}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{r.atleta}</div>
                      <div className="text-xs text-muted-foreground">{r.clube}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-xs tabular-nums text-muted-foreground">
                      +{r.reacao || "—"}s
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-xs tabular-nums text-muted-foreground">
                      {r.split50m ? `${r.split50m}s` : "—"}
                    </td>
                    <td className={`px-4 py-3.5 font-mono font-extrabold text-sm tabular-nums ${r.status === "DQ" ? "text-destructive line-through" : "text-sky-400"}`}>
                      {r.tempo}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {r.colocacao === 1 && r.status === "Aprovado" ? (
                        <Badge className="bg-destructive border-0 text-white font-bold animate-pulse text-[10px] py-0.5">
                          BR (Recorde Brasileiro)
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold font-mono text-xs text-foreground">
                      {r.status === "DQ" ? 0 : 902 - idx * 25}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewType === "serie" && (
          <div className="space-y-6">
            {/* Heat 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-white">
                  S1
                </span>
                <h4 className="font-bold text-sm text-foreground">Série 1 de 1 — Prova Final</h4>
              </div>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2 w-12">Raia</th>
                    <th className="px-4 py-2">Competidor / Clube</th>
                    <th className="px-4 py-2 text-center">Tempo Oficial</th>
                    <th className="px-4 py-2 text-center">Col. Série</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initialResults.map((r, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-3 font-semibold text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground text-xs">{r.atleta}</div>
                        <div className="text-[10px] text-muted-foreground">{r.clube}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-sky-400 tabular-nums">
                        {r.tempo}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-foreground">
                        {r.colocacao}º
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={r.status === "Aprovado" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewType === "clube" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Classificação Geral por Clubes (Quadro de Pontos e Medalhas)
              </h3>
              <Badge variant="outline" className="border-primary/20 text-sky-400">
                Pontuação Somada (Troféu Eficiência)
              </Badge>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2.5 text-center w-12">Pos.</th>
                  <th className="px-4 py-2.5">Clube / Federação</th>
                  <th className="px-4 py-2.5 text-center bg-yellow-500/10 text-yellow-500 w-16">Ouro</th>
                  <th className="px-4 py-2.5 text-center bg-slate-400/10 text-slate-300 w-16">Prata</th>
                  <th className="px-4 py-2.5 text-center bg-amber-700/10 text-amber-600 w-16">Bronze</th>
                  <th className="px-4 py-2.5 text-right w-24">Pontos Totais</th>
                </tr>
              </thead>
              <tbody>
                {mockClubPoints.map((c) => (
                  <tr key={c.pos} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3.5 text-center font-bold">
                      {c.pos}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{c.clube}</div>
                      <div className="text-xs text-muted-foreground">Regional: {c.uf}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold bg-yellow-500/5 text-yellow-500 tabular-nums">
                      {c.ouro}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold bg-slate-400/5 text-slate-300 tabular-nums">
                      {c.prata}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold bg-amber-750/5 text-amber-600 tabular-nums">
                      {c.bronze}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-sm text-sky-400 tabular-nums">
                      {c.pontos.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}

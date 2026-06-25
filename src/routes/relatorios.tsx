import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  ListOrdered,
  ClipboardList,
  BarChart3,
  Award,
  Trophy,
  Building2,
  Users,
  FileSpreadsheet,
  FileType,
  Eye,
  Download,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios & Exportações — AquaFlow" },
      { name: "description", content: "Módulo de exportação de start lists, súmulas, rankings e relatórios em PDF/Excel." },
    ],
  }),
  component: RelatoriosManager,
});

interface ReportItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  previewHeaders: string[];
  previewRows: string[][];
}

const reports: ReportItem[] = [
  {
    id: "rep-1",
    label: "Balizamento por Série",
    desc: "Folhas de séries e distribuição de raias para a mesa de arbitragem.",
    icon: ListOrdered,
    previewHeaders: ["Série", "Raia", "Atleta", "Clube", "Tempo Insc."],
    previewRows: [
      ["1", "4", "João Silva", "Minas TC", "00:48.21"],
      ["1", "5", "Pedro Alencar", "SESI-SP", "00:49.12"],
      ["1", "3", "Lucas Ferreira", "Flamengo", "00:51.10"],
    ],
  },
  {
    id: "rep-2",
    label: "Start List Geral",
    desc: "Lista oficial de competidores inscritos na sessão de provas.",
    icon: ClipboardList,
    previewHeaders: ["Código", "Nadador", "Nasc.", "Categoria", "Clube"],
    previewRows: [
      ["BR-10234", "João Silva", "2002", "Sênior", "Minas TC"],
      ["BR-20891", "Pedro Alencar", "2004", "Sênior", "SESI-SP"],
      ["BR-30122", "Lucas Ferreira", "2001", "Sênior", "Flamengo"],
    ],
  },
  {
    id: "rep-3",
    label: "Livro de Resultados",
    desc: "Resultado final homologado com parciais de toques, splits e DQs.",
    icon: BarChart3,
    previewHeaders: ["Col.", "Atleta", "Tempo", "Recorde", "Pontos FINA"],
    previewRows: [
      ["1º", "João Silva", "00:51.23", "BR", "910"],
      ["2º", "Pedro Alencar", "00:51.87", "—", "885"],
      ["3º", "Lucas Ferreira", "00:52.10", "—", "870"],
    ],
  },
  {
    id: "rep-4",
    label: "Recordes Superados",
    desc: "Listagem de todas as novas marcas estabelecidas no campeonato.",
    icon: Award,
    previewHeaders: ["Prova", "Atleta", "Tempo", "Escopo", "Data"],
    previewRows: [
      ["50m Livre M", "João Silva", "21.45s", "Brasileiro", "2026-04-13"],
      ["200m Medley M", "Pedro Alencar", "1:58.34", "Continental", "2026-04-14"],
    ],
  },
  {
    id: "rep-5",
    label: "Quadro de Medalhas",
    desc: "Classificação geral de pontos e contagem de ouros/pratas/bronzes por clube.",
    icon: Trophy,
    previewHeaders: ["Pos.", "Clube", "Ouro", "Prata", "Bronze", "Total Pts"],
    previewRows: [
      ["1", "Minas TC", "8", "5", "4", "342.0"],
      ["2", "SESI-SP", "5", "6", "3", "288.0"],
    ],
  },
  {
    id: "rep-6",
    label: "Listagem de Clubes",
    desc: "Dados cadastrais e anuidades das entidades participantes.",
    icon: Building2,
    previewHeaders: ["Sigla", "Clube", "Federação", "Atletas", "Situação"],
    previewRows: [
      ["MTC", "Minas Tênis Clube", "FAM-MG", "84", "Ativo"],
      ["SESI", "SESI-SP", "FAP-SP", "76", "Ativo"],
    ],
  },
];

function RelatoriosManager() {
  const { role, canExportReports } = useRBAC();
  const [selectedReport, setSelectedReport] = useState<ReportItem>(reports[0]);

  const handleExport = (format: "PDF" | "Excel" | "CSV") => {
    if (!canExportReports) {
      toast.error("Seu perfil de acesso atual não possui permissões de exportação.");
      return;
    }
    toast.success(`Relatório "${selectedReport.label}" gerado e exportado em formato ${format}!`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gestão de Relatórios & Exportações"
        description="Geração de súmulas, listagens cadastrais, livros de resultados e relatórios executivos homologados."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left column: Report templates */}
        <div className="space-y-3.5">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r)}
              className={`flex w-full flex-col text-left rounded-xl border p-4 transition-all ${
                selectedReport.id === r.id
                  ? "border-primary bg-primary/5 shadow"
                  : "border-border/40 bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                  <r.icon className="h-4.5 w-4.5" />
                </span>
                <span className="font-bold text-foreground text-xs">{r.label}</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-normal">{r.desc}</p>
            </button>
          ))}
        </div>

        {/* Right column: Visual preview sheet */}
        <div className="space-y-4">
          <Card className="p-5 border-border/40 space-y-4">
            {/* Sheet header */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/20 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Pré-visualização do Documento Oficial</h3>
                  <p className="text-[10px] text-muted-foreground">Layout de impressão padrão FINA/World Aquatics</p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2 sm:mt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-primary/15 border-primary/20 text-sky-400 font-bold"
                  onClick={() => handleExport("PDF")}
                >
                  <FileType className="mr-1 h-3.5 w-3.5" /> PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-success/15 border-success/20 text-success font-bold"
                  onClick={() => handleExport("Excel")}
                >
                  <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-slate-800 border-border/60 text-slate-300 font-bold"
                  onClick={() => handleExport("CSV")}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> CSV
                </Button>
              </div>
            </div>

            {/* Document sheet mockup */}
            <div className="rounded border border-slate-700 bg-slate-950 p-6 text-slate-300 font-serif shadow-inner min-h-[300px]">
              {/* CBDA Letterhead */}
              <div className="text-center border-b border-slate-800 pb-4 mb-4 text-xs font-bold font-sans uppercase tracking-widest text-slate-200">
                <h2>CONFEDERAÇÃO BRASILEIRA DE DESPORTOS AQUÁTICOS</h2>
                <h3 className="text-[10px] text-sky-400 mt-1">SGE AQUÁTICOS · CADERNO OFICIAL</h3>
              </div>

              <div className="text-[11px] font-sans font-bold mb-4 flex justify-between">
                <span>Relatório: {selectedReport.label}</span>
                <span>Data: {new Date().toLocaleDateString("pt-BR")}</span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-200 text-xs">
                      {selectedReport.previewHeaders.map((header, idx) => (
                        <th key={idx} className="pb-2 font-bold font-sans uppercase">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.previewRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900 last:border-0">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footnotes */}
              <div className="mt-8 pt-4 border-t border-slate-800 text-[9px] font-sans text-slate-500 text-center">
                <p>AquaFlow Sports Systems · v1.0 · Documento eletrônico gerado de acordo com as regras técnicas vigentes.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

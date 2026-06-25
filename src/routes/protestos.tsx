import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Upload,
  ShieldAlert,
  FileCheck,
  Play,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { protests as initialProtests, Protest } from "@/lib/data";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/protestos")({
  head: () => ({
    meta: [
      { title: "Gestão de Protestos Esportivos — AquaFlow" },
      { name: "description", content: "Fluxo digital de protestos de competições de natação, anexos de mídia e decisões oficiais." },
    ],
  }),
  component: ProtestosManager,
});

function ProtestosManager() {
  const { role, canJudgeProtests, canFileProtests } = useRBAC();
  const [list, setList] = useState<Protest[]>(initialProtests);
  const [selectedProtest, setSelectedProtest] = useState<Protest | null>(initialProtests[0]);

  // Form states for new Protest
  const [newComp, setNewComp] = useState("Troféu Brasil");
  const [newProva, setNewProva] = useState("100m Livre");
  const [newClube, setNewClube] = useState("Minas Tênis Clube");
  const [newAtleta, setNewAtleta] = useState("João Silva");
  const [newDesc, setNewDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // General resolution text state
  const [resolutionText, setResolutionText] = useState("");

  const handleCreateProtest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc) {
      toast.error("Por favor, detalhe os termos do protesto.");
      return;
    }

    const created: Protest = {
      id: `P-00${list.length + 1}`,
      competicao: newComp,
      prova: newProva,
      clube: newClube,
      atleta: newAtleta,
      data: new Date().toISOString().split("T")[0],
      status: "Aberto",
      descricao: newDesc,
      anexos: ["boletim_oficial.pdf", "declaracao_tecnico.txt"],
      custo: 500,
    };

    setList([created, ...list]);
    setSelectedProtest(created);
    setIsDialogOpen(false);
    toast.success(
      `Protesto ${created.id} protocolado! Taxa de R$ 500,00 gerada de acordo com as regras FINA.`
    );
    setNewDesc("");
  };

  const handleJudge = (status: "Deferido" | "Indeferido") => {
    if (!selectedProtest) return;
    if (!resolutionText && status === "Deferido") {
      toast.error("Por favor, descreva a resolução/correção aplicada.");
      return;
    }

    const updated = {
      ...selectedProtest,
      status: status,
      resolucao: resolutionText || (status === "Indeferido" ? "Protesto rejeitado pelo comitê técnico." : ""),
    };

    setList(list.map((p) => (p.id === selectedProtest.id ? updated : p)));
    setSelectedProtest(updated);
    setResolutionText("");
    toast.success(`Protesto julgado como ${status}!`);
  };

  const handleMoveToAnalysis = () => {
    if (!selectedProtest) return;
    const updated = { ...selectedProtest, status: "Em análise" as const };
    setList(list.map((p) => (p.id === selectedProtest.id ? updated : p)));
    setSelectedProtest(updated);
    toast.info("Status do protesto alterado para Em análise.");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Deferido":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Indeferido":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "Em análise":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Deferido":
        return "text-success bg-success/15 border-success/30";
      case "Indeferido":
        return "text-destructive bg-destructive/15 border-destructive/30";
      case "Em análise":
        return "text-warning bg-warning/15 border-warning/30";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gestão Digital de Protestos"
        description="Portal de protocolo de recursos e disputas oficiais baseados nas regras World Aquatics. Taxa FINA R$ 500,00."
        action={
          canFileProtests && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Protocolar Protesto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Protocolar Novo Protesto Oficial</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProtest} className="space-y-4 pt-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="p_comp">Competição</Label>
                      <Input id="p_comp" value={newComp} onChange={(e) => setNewComp(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p_prova">Prova</Label>
                      <Input id="p_prova" value={newProva} onChange={(e) => setNewProva(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p_clube">Clube Reclamante</Label>
                      <Input id="p_clube" value={newClube} onChange={(e) => setNewClube(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p_atleta">Atleta Envolvido</Label>
                      <Input id="p_atleta" value={newAtleta} onChange={(e) => setNewAtleta(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="p_desc">Fundamentação Jurídico-Esportiva</Label>
                    <Textarea
                      id="p_desc"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Descreva a infração, indicando raia, tempo divergente ou decisão do juiz de partida contestada."
                      rows={4}
                    />
                  </div>

                  {/* Attachment input simulation */}
                  <div className="rounded-lg border border-dashed border-border p-3.5 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:bg-muted/10">
                    <Upload className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Anexar Mídia de Apoio (Vídeos da chegada, fotos)</span>
                    <span className="text-[10px] text-muted-foreground">Arraste e solte ou clique para selecionar</span>
                  </div>

                  {/* Cost disclosure */}
                  <div className="bg-slate-900 border border-slate-800 rounded p-3 text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-success" /> Taxa de Protesto CBDA:</span>
                    <span className="font-bold text-sky-400">R$ 500,00</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Efetuar Protocolo</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Protest list */}
        <Card className="overflow-x-auto p-4 border-border/40">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-3 py-3">Competição / Prova</th>
                <th className="px-3 py-3">Clube</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProtest(p)}
                  className={`border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer ${
                    selectedProtest?.id === p.id ? "bg-primary/5 font-semibold" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 font-bold text-sky-400">{p.id}</td>
                  <td className="px-3 py-3.5">
                    <div className="text-foreground">{p.competicao}</div>
                    <div className="text-xs text-muted-foreground">{p.prova}</div>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-muted-foreground font-medium">{p.clube}</td>
                  <td className="px-3 py-3.5 text-xs text-muted-foreground">
                    {new Date(p.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge className={getStatusClass(p.status)} variant="outline">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Right Side: Detail & resolution panel */}
        <div>
          {selectedProtest ? (
            <Card className="p-5 border-border/40 sticky top-20 text-xs leading-normal space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-warning" />
                  <h3 className="text-sm font-bold text-foreground">Detalhes do Protocolo {selectedProtest.id}</h3>
                </div>
                <Badge className={getStatusClass(selectedProtest.status)} variant="outline">
                  {selectedProtest.status}
                </Badge>
              </div>

              {/* General details */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Atleta Reclamante</span>
                <p className="text-foreground font-semibold">{selectedProtest.atleta} ({selectedProtest.clube})</p>
                <p className="text-muted-foreground text-[10px]">{selectedProtest.competicao} · {selectedProtest.prova}</p>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Alegação do Recurso</span>
                <p className="text-slate-300 p-2.5 rounded bg-muted/20 border border-border/40 italic">
                  "{selectedProtest.descricao}"
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Evidências Anexadas</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProtest.anexos.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded border border-border p-2 bg-muted/5 font-medium truncate">
                      {file.endsWith(".mp4") ? <Play className="h-3.5 w-3.5 text-warning shrink-0" /> : <Folder className="h-3.5 w-3.5 text-primary shrink-0" />}
                      <span className="truncate text-[10px]">{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution details */}
              {selectedProtest.resolucao && (
                <div className="space-y-1 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-success uppercase block font-bold">Parecer e Resolução Final</span>
                  <p className="text-foreground font-medium p-2.5 rounded bg-success/5 border border-success/20">
                    {selectedProtest.resolucao}
                  </p>
                </div>
              )}

              {/* Referee resolution controls */}
              {canJudgeProtests && (selectedProtest.status === "Aberto" || selectedProtest.status === "Em análise") && (
                <div className="pt-3 border-t border-border/20 space-y-3">
                  <span className="text-[10px] text-muted-foreground uppercase block font-bold">Resolução Técnica (Árbitro Geral)</span>
                  
                  {selectedProtest.status === "Aberto" && (
                    <Button size="sm" variant="outline" className="w-full" onClick={handleMoveToAnalysis}>
                      Mover para Análise Oficial
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="res_text" className="text-[10px]">Justificativa do Parecer</Label>
                    <Textarea
                      id="res_text"
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Descreva o parecer, indicando alterações de tempos ou confirmação de DQs."
                      rows={3}
                      className="bg-card border-border/60 text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-success hover:bg-success/90 text-white"
                      onClick={() => handleJudge("Deferido")}
                    >
                      Deferir (Aceitar)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleJudge("Indeferido")}
                    >
                      Indeferir (Rejeitar)
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm text-muted-foreground">
              Selecione um protesto esportivo para analisar e emitir parecer.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

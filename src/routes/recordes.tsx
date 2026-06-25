import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Medal,
  Award,
  Search,
  Zap,
  CheckCircle,
  Plus,
  Tv,
  Globe,
  Compass,
  Building,
  Flag,
  Sparkles,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRBAC } from "@/lib/rbac";
import { records as initialRecords } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/recordes")({
  head: () => ({
    meta: [
      { title: "Recordes Oficiais — AquaFlow" },
      { name: "description", content: "Tabela oficial de recordes mundiais, continentais, nacionais e de campeonato." },
    ],
  }),
  component: RecordesManager,
});

interface RecordItem {
  prova: string;
  atleta: string;
  clube: string;
  tempo: string;
  tipo: string; // Mundial, Continental, Nacional, Estadual, Competição
  data: string;
}

function RecordesManager() {
  const { role, canHomologateRecords } = useRBAC();
  const [list, setList] = useState<RecordItem[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("TODOS");

  // Form states for record simulation
  const [simName, setSimName] = useState("");
  const [simTime, setSimTime] = useState("");
  const [simProva, setSimProva] = useState("50m Livre");
  const [simClube, setSimClube] = useState("Minas TC");
  const [simTipo, setSimTipo] = useState("Nacional");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSimulateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simTime) {
      toast.error("Por favor, preencha o nome do nadador e o tempo.");
      return;
    }

    const newRecord: RecordItem = {
      prova: simProva,
      atleta: simName,
      clube: simClube,
      tempo: simTime,
      tipo: simTipo,
      data: new Date().toISOString().split("T")[0],
    };

    setList([newRecord, ...list]);
    setIsDialogOpen(false);
    toast.success(
      `🎉 ESPETACULAR! Novo Recorde ${simTipo} estabelecido na prova ${simProva} por ${simName} (${simTime}s)!`,
      { duration: 6000 }
    );

    // Reset inputs
    setSimName("");
    setSimTime("");
  };

  const handleHomologate = (recordName: string) => {
    toast.success(`Recorde de "${recordName}" homologado formalmente pela Confederação!`);
  };

  const getRecordBadge = (tipo: string) => {
    switch (tipo) {
      case "Mundial":
        return <Badge className="bg-red-600 hover:bg-red-600 text-white font-bold border-0 animate-pulse"><Globe className="h-3 w-3 mr-1" /> WR</Badge>;
      case "Continental":
      case "Americas":
        return <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold border-0"><Compass className="h-3 w-3 mr-1" /> AR</Badge>;
      case "Nacional":
      case "Brasileiro":
        return <Badge className="bg-primary hover:bg-primary text-white font-bold border-0"><Flag className="h-3 w-3 mr-1" /> BR</Badge>;
      case "Estadual":
        return <Badge className="bg-success hover:bg-success text-white font-bold border-0"><Building className="h-3 w-3 mr-1" /> ER</Badge>;
      default:
        return <Badge className="bg-slate-700 hover:bg-slate-700 text-white font-bold border-0"><Sparkles className="h-3 w-3 mr-1" /> CR</Badge>;
    }
  };

  const filteredList = list.filter((r) => {
    const matchesSearch = r.atleta.toLowerCase().includes(search.toLowerCase()) || r.prova.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = filterTipo === "TODOS" || r.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Quadro Geral de Recordes"
        description="Recordes vigentes homologados. Sistema de detecção de marcas e bandeiras em tempo real."
        action={
          role !== "Público" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Registrar Recorde
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Simular / Registrar Novo Recorde</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSimulateRecord} className="space-y-4 pt-4 text-xs">
                  <div className="space-y-1">
                    <Label htmlFor="sim_atleta">Nome do Atleta</Label>
                    <Input id="sim_atleta" value={simName} onChange={(e) => setSimName(e.target.value)} placeholder="Ex: César Cielo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="sim_tempo">Tempo Recorde (MM:SS.hh)</Label>
                      <Input id="sim_tempo" value={simTime} onChange={(e) => setSimTime(e.target.value)} placeholder="Ex: 00:20.91" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sim_prova">Prova</Label>
                      <Input id="sim_prova" value={simProva} onChange={(e) => setSimProva(e.target.value)} placeholder="Ex: 50m Livre" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sim_clube">Clube</Label>
                      <Input id="sim_clube" value={simClube} onChange={(e) => setSimClube(e.target.value)} placeholder="Ex: Minas TC" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sim_scope">Escopo do Recorde</Label>
                      <select
                        id="sim_scope"
                        value={simTipo}
                        onChange={(e: any) => setSimTipo(e.target.value)}
                        className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-9 focus:outline-none"
                      >
                        <option value="Mundial">Mundial (WR)</option>
                        <option value="Continental">Sul-Americano (AR)</option>
                        <option value="Nacional">Brasileiro (BR)</option>
                        <option value="Estadual">Estadual (ER)</option>
                        <option value="Competição">Championship Record (CR)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Gravar Novo Recorde</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Record statistics summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Recorde Mundial (WR)", count: list.filter(r => r.tipo === "Mundial").length, color: "border-red-500/30 bg-red-500/5 text-red-400" },
          { label: "Sul-Americano (AR)", count: list.filter(r => r.tipo === "Continental" || r.tipo === "Americas").length, color: "border-orange-500/30 bg-orange-500/5 text-orange-400" },
          { label: "Nacional / Brasileiro", count: list.filter(r => r.tipo === "Nacional" || r.tipo === "Brasileiro").length, color: "border-blue-500/30 bg-blue-500/5 text-primary" },
          { label: "Campeonato / Estaduais", count: list.filter(r => r.tipo === "Competição" || r.tipo === "Estadual").length, color: "border-slate-500/30 bg-slate-500/5 text-slate-300" }
        ].map((item, idx) => (
          <Card key={idx} className={`p-4 text-center ${item.color}`}>
            <span className="text-xs font-semibold block uppercase tracking-wider">{item.label}</span>
            <span className="mt-1 text-2xl font-bold block">{item.count} vigentes</span>
          </Card>
        ))}
      </div>

      {/* Filter and Table Section */}
      <div className="space-y-4">
        <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por atleta ou prova de nado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-muted-foreground">Escopo:</span>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="rounded border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none"
            >
              <option value="TODOS">Todos os recordes</option>
              <option value="Mundial">Mundial (WR)</option>
              <option value="Continental">Sul-Americano (AR)</option>
              <option value="Nacional">Brasileiro (BR)</option>
              <option value="Estadual">Estadual (ER)</option>
              <option value="Competição">Competição (CR)</option>
            </select>
          </div>
        </Card>

        {/* Results grid list */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filteredList.map((rec, idx) => (
            <Card key={idx} className="p-4 border-border/40 bg-card hover:bg-muted/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  {getRecordBadge(rec.tipo)}
                  <span className="font-mono font-bold text-sky-400 text-base tracking-tight tabular-nums">
                    {rec.tempo}s
                  </span>
                </div>
                <h4 className="mt-3.5 font-bold text-foreground text-sm leading-tight">{rec.prova}</h4>
                <p className="mt-1 text-xs font-semibold text-foreground flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-warning shrink-0" /> {rec.atleta}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{rec.clube}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Data: {new Date(rec.data).toLocaleDateString("pt-BR")}</span>
                
                {canHomologateRecords && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-sky-400 hover:text-sky-500 font-bold"
                    onClick={() => handleHomologate(rec.atleta)}
                  >
                    Homologar
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredList.length === 0 && (
            <div className="col-span-full text-center text-xs text-muted-foreground italic py-8 border border-dashed border-border/40 rounded bg-muted/10">
              Nenhum recorde correspondente aos filtros foi localizado.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Gavel,
  BookOpen,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Star,
  Activity,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { officials as initialOfficials, Official } from "@/lib/data";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/arbitragem")({
  head: () => ({
    meta: [
      { title: "Arbitragem & Oficiais — AquaFlow" },
      {
        name: "description",
        content:
          "Escalamento de oficiais de arbitragem, clínicas de reciclagem e avaliação técnica.",
      },
    ],
  }),
  component: ArbitragemManager,
});

function ArbitragemManager() {
  const { role, canManageCompetitions } = useRBAC();
  const [list, setList] = useState<Official[]>(initialOfficials);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("TODOS");
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(initialOfficials[0]);

  // Form states for new Official
  const [newName, setNewName] = useState("");
  const [newFuncao, setNewFuncao] = useState("Juiz de Nado");
  const [newFederacao, setNewFederacao] = useState("FAP-SP");
  const [newNivel, setNewNivel] = useState<"Regional" | "Nacional" | "Internacional FINA">(
    "Regional",
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states for adding Scale
  const [scaleCompeticao, setScaleCompeticao] = useState("");
  const [scaleProva, setScaleProva] = useState("");
  const [scalePosicao, setScalePosicao] = useState("");
  const [isScaleDialogOpen, setIsScaleDialogOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      toast.error("Por favor, insira o nome do oficial.");
      return;
    }

    const created: Official = {
      id: (list.length + 1).toString(),
      nome: newName,
      funcao: newFuncao,
      federacao: newFederacao,
      competicao: "Sem escala ativa",
      formacao: ["Curso Estadual Básico"],
      certificacoes: [`Oficial ${newNivel}`],
      clinicas: ["Reciclagem Regras 2026"],
      escalas: [],
      avaliacoes: 9.0,
      atuacaoAnual: 0,
      nivel: newNivel,
      elegivel: true,
    };

    setList([created, ...list]);
    setSelectedOfficial(created);
    setIsDialogOpen(false);
    toast.success("Oficial técnico cadastrado com sucesso!");
    setNewName("");
  };

  const handleAddScale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficial || !scaleCompeticao || !scaleProva) {
      toast.error("Preencha todos os campos da escala.");
      return;
    }

    const newScale = {
      competicao: scaleCompeticao,
      prova: scaleProva,
      posicao: scalePosicao || selectedOfficial.funcao,
    };

    const updatedOfficial = {
      ...selectedOfficial,
      competicao: scaleCompeticao,
      atuacaoAnual: selectedOfficial.atuacaoAnual + 1,
      escalas: [...selectedOfficial.escalas, newScale],
    };

    setList(list.map((o) => (o.id === selectedOfficial.id ? updatedOfficial : o)));
    setSelectedOfficial(updatedOfficial);
    setIsScaleDialogOpen(false);
    setScaleCompeticao("");
    setScaleProva("");
    setScalePosicao("");
    toast.success(`Oficial escalado com sucesso para a prova ${scaleProva}!`);
  };

  const handleToggleEligibility = () => {
    if (!selectedOfficial) return;
    const updated = { ...selectedOfficial, elegivel: !selectedOfficial.elegivel };
    setList(list.map((o) => (o.id === selectedOfficial.id ? updated : o)));
    setSelectedOfficial(updated);
    toast.success(
      `Elegibilidade do oficial alterada para: ${updated.elegivel ? "Elegível" : "Inelegível"}`,
    );
  };

  // Filters
  const filteredList = list.filter((o) => {
    const matchesSearch =
      o.nome.toLowerCase().includes(search.toLowerCase()) ||
      o.funcao.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === "TODOS" || o.nivel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Gestão de Arbitragem & Oficiais"
        description="Quadro técnico nacional de árbitros, fiscais, starters e cronometristas da modalidade."
        action={
          canManageCompetitions && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Cadastrar Oficial
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Novo Oficial de Arbitragem</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome_oficial">Nome Completo</Label>
                    <Input
                      id="nome_oficial"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Roberto Carlos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="funcao_oficial">Função Principal</Label>
                      <Input
                        id="funcao_oficial"
                        value={newFuncao}
                        onChange={(e) => setNewFuncao(e.target.value)}
                        placeholder="Ex: Starter"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fed_oficial">Federação (UF)</Label>
                      <Input
                        id="fed_oficial"
                        value={newFederacao}
                        onChange={(e) => setNewFederacao(e.target.value)}
                        placeholder="Ex: FAP-SP"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="nivel_oficial">Nível Técnico</Label>
                      <select
                        id="nivel_oficial"
                        value={newNivel}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setNewNivel(e.target.value)
                        }
                        className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-9 focus:outline-none"
                      >
                        <option value="Regional">Regional</option>
                        <option value="Nacional">Nacional</option>
                        <option value="Internacional FINA">
                          Internacional FINA / World Aquatics
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar Oficial</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left column: Filters and Table list */}
        <div className="space-y-4">
          <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar oficial por nome ou função..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="TODOS">Todos os níveis</option>
                  <option value="Regional">Regional</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Internacional FINA">Internacional FINA</option>
                </select>
              </div>
            </div>
          </Card>

          {/* List of officials */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredList.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOfficial(o)}
                className={`flex flex-col justify-between rounded-xl border p-4.5 text-left transition-all ${
                  selectedOfficial?.id === o.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/40 bg-card hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="outline">{o.nivel}</Badge>
                    <span className="flex items-center gap-1 text-xs">
                      {o.elegivel ? (
                        <span className="flex items-center gap-1 text-success font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" /> Elegível
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive font-semibold">
                          <XCircle className="h-3.5 w-3.5" /> Suspenso
                        </span>
                      )}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-foreground text-sm leading-tight">{o.nome}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Função: <strong className="text-foreground">{o.funcao}</strong>
                    {" · "}Federação: {o.federacao}
                  </p>
                </div>
                <div className="mt-4 pt-3.5 border-t border-border/20 flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" /> Avaliação:{" "}
                    <strong className="text-foreground">{o.avaliacoes}</strong>
                  </span>
                  <span>
                    Atuação: <strong className="text-foreground">{o.atuacaoAnual} eventos</strong>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Detailed card */}
        <div>
          {selectedOfficial ? (
            <Card className="p-5 border-border/40 sticky top-20">
              <div className="flex items-center gap-3 border-b border-border/20 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Gavel className="h-6 w-6" />
                </div>
                <div className="leading-tight">
                  <h2 className="text-base font-bold text-foreground">{selectedOfficial.nome}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Nível: <strong className="text-sky-400">{selectedOfficial.nivel}</strong>
                    {" · "}Federação: {selectedOfficial.federacao}
                  </p>
                </div>
              </div>

              {/* Status and KPIs Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="rounded bg-muted/30 border border-border p-2">
                  <span className="text-[10px] text-muted-foreground block">Eventos Anuais</span>
                  <span className="font-bold text-sm text-foreground">
                    {selectedOfficial.atuacaoAnual}
                  </span>
                </div>
                <div className="rounded bg-muted/30 border border-border p-2">
                  <span className="text-[10px] text-muted-foreground block">Avaliação Geral</span>
                  <span className="font-bold text-sm text-foreground">
                    {selectedOfficial.avaliacoes}
                  </span>
                </div>
                <div className="rounded bg-muted/30 border border-border p-2">
                  <span className="text-[10px] text-muted-foreground block">Elegível</span>
                  <Badge
                    variant={selectedOfficial.elegivel ? "default" : "destructive"}
                    className="text-[10px] px-1.5 py-0 mt-0.5"
                  >
                    {selectedOfficial.elegivel ? "SIM" : "NÃO"}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="formacao" className="mt-5">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="formacao" className="text-xs">
                    Formação
                  </TabsTrigger>
                  <TabsTrigger value="clinicas" className="text-xs">
                    Reciclagens
                  </TabsTrigger>
                  <TabsTrigger value="escalas" className="text-xs">
                    Escalas
                  </TabsTrigger>
                </TabsList>

                {/* Formacao / Certificacoes Tab */}
                <TabsContent value="formacao" className="space-y-4 pt-3.5 text-xs">
                  <div>
                    <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                      <BookOpen className="h-4 w-4" /> Cursos & Formação Acadêmica
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4 text-foreground font-medium">
                      {selectedOfficial.formacao.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-border/20">
                    <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                      <Award className="h-4 w-4 text-primary" /> Certificações Oficiais
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOfficial.certificacoes.map((c, i) => (
                        <Badge key={i} variant="outline" className="border-primary/20 text-sky-400">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Clinicas / Reciclagens Tab */}
                <TabsContent value="clinicas" className="space-y-3 pt-3.5 text-xs">
                  <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                    Clínicas de Reciclagem FINA / CBDA Concluídas
                  </h4>
                  {selectedOfficial.clinicas.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOfficial.clinicas.map((cl, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2.5"
                        >
                          <Activity className="h-4 w-4 text-success shrink-0" />
                          <span className="font-medium text-foreground">{cl}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/10 p-2 rounded">
                      Nenhuma clínica de reciclagem cadastrada.
                    </p>
                  )}
                </TabsContent>

                {/* Escalas Tab */}
                <TabsContent value="escalas" className="space-y-3.5 pt-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Escalas Ativas de Arbitragem
                    </h4>
                    {role !== "Público" && (
                      <Dialog open={isScaleDialogOpen} onOpenChange={setIsScaleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Nova Escala
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Escalar Oficial Técnico</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddScale} className="space-y-4 pt-4 text-xs">
                            <div className="space-y-1">
                              <Label htmlFor="scale_comp">Competição</Label>
                              <Input
                                id="scale_comp"
                                value={scaleCompeticao}
                                onChange={(e) => setScaleCompeticao(e.target.value)}
                                placeholder="Ex: Campeonato Brasileiro Troféu Brasil"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="scale_prova">Prova / Série</Label>
                              <Input
                                id="scale_prova"
                                value={scaleProva}
                                onChange={(e) => setScaleProva(e.target.value)}
                                placeholder="Ex: 100m Livre Masculino Série 4"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="scale_pos">Posição na Escala (opcional)</Label>
                              <Input
                                id="scale_pos"
                                value={scalePosicao}
                                onChange={(e) => setScalePosicao(e.target.value)}
                                placeholder="Ex: Starter (Juiz de Partida)"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsScaleDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit">Efetivar Escala</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {selectedOfficial.escalas.length > 0 ? (
                      selectedOfficial.escalas.map((esc, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border/50 bg-card p-3 text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-foreground">{esc.prova}</p>
                            <p className="text-[10px] text-muted-foreground">{esc.competicao}</p>
                          </div>
                          <Badge className="bg-primary/20 text-sky-400 border border-primary/20">
                            {esc.posicao}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic bg-muted/10 p-2 rounded">
                        Sem escalas de provas para os próximos dias.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Administrative actions */}
              {role !== "Público" && (
                <div className="mt-5 pt-4 border-t border-border/20 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={handleToggleEligibility}
                  >
                    {selectedOfficial.elegivel ? "Suspender Arbitragem" : "Homologar Elegibilidade"}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm text-muted-foreground">
              Selecione um oficial técnico para inspecionar escalas e qualificações.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

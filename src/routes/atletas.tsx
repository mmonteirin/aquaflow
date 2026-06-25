import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  User,
  History,
  TrendingUp,
  MapPin,
  Calendar,
  FileCheck,
  Building,
  Image,
  Award,
  IdCard,
  Printer,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { athletes as initialAthletes, Athlete, AthleteTransfer } from "@/lib/data";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/atletas")({
  head: () => ({
    meta: [
      { title: "Cadastro Nacional de Atletas — AquaFlow" },
      {
        name: "description",
        content:
          "Cadastro centralizado de atletas com categorização automática e timeline esportiva.",
      },
    ],
  }),
  component: AtletasManager,
});

function calculateAge(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / 31557600000);
}

function getAutomaticCategory(birthDate: string): string {
  const age = calculateAge(birthDate);
  if (age <= 8) return "Pré-Mirim";
  if (age <= 10) return "Mirim";
  if (age <= 12) return "Petiz";
  if (age <= 14) return "Infantil";
  if (age <= 16) return "Juvenil";
  if (age <= 18) return "Júnior";
  return "Sênior";
}

function AtletasManager() {
  const { role, canRegisterAthletes } = useRBAC();
  const [list, setList] = useState<Athlete[]>(initialAthletes);
  const [search, setSearch] = useState("");
  const [filterSex, setFilterSex] = useState<string>("TODOS");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(initialAthletes[0]);

  // Form states for new Athlete
  const [newNome, setNewNome] = useState("");
  const [newSexo, setNewSexo] = useState<"M" | "F">("M");
  const [newNasc, setNewNasc] = useState("");
  const [newNac, setNewNac] = useState("Brasil");
  const [newClube, setNewClube] = useState("Minas Tênis Clube");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Transfer states
  const [transferClubeDestino, setTransferClubeDestino] = useState("");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newNasc) {
      toast.error("Por favor, preencha o nome e a data de nascimento.");
      return;
    }

    const birthYear = newNasc.split("-")[0];
    const category = getAutomaticCategory(newNasc);
    const newReg = `BR-${Math.floor(10000 + Math.random() * 90000)}`;

    const created: Athlete = {
      id: (list.length + 1).toString(),
      nome: newNome,
      sexo: newSexo,
      nascimento: newNasc,
      nacionalidade: newNac,
      clube: newClube,
      registro: newReg,
      categoria: category,
      status: "Ativo",
      foto: "",
      clubesAnteriores: [],
      transferencias: [],
      resultadosHistoricos: [],
      timeline: [
        {
          data: new Date().toISOString().split("T")[0],
          titulo: "Inscrição Homologada",
          descricao: `Registro esportivo criado com código único ${newReg}`,
          iconType: "registro",
        },
      ],
    };

    setList([created, ...list]);
    setSelectedAthlete(created);
    setIsDialogOpen(false);
    toast.success(`Atleta registrado! Categoria automática: ${category}`);

    // Clear form
    setNewNome("");
    setNewNasc("");
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !transferClubeDestino) return;

    const newTransfer: AthleteTransfer = {
      data: new Date().toISOString().split("T")[0],
      origem: selectedAthlete.clube,
      destino: transferClubeDestino,
      taxa: 200,
      status: "Homologado",
    };

    const updatedTimeline = [
      {
        data: newTransfer.data,
        titulo: "Transferência de Clube",
        descricao: `Transferido do ${newTransfer.origem} para o ${newTransfer.destino}`,
        iconType: "transferencia" as const,
      },
      ...selectedAthlete.timeline,
    ];

    const updatedAthlete: Athlete = {
      ...selectedAthlete,
      clube: transferClubeDestino,
      clubesAnteriores: [...selectedAthlete.clubesAnteriores, selectedAthlete.clube],
      transferencias: [newTransfer, ...selectedAthlete.transferencias],
      timeline: updatedTimeline,
    };

    setList(list.map((a) => (a.id === selectedAthlete.id ? updatedAthlete : a)));
    setSelectedAthlete(updatedAthlete);
    setIsTransferDialogOpen(false);
    setTransferClubeDestino("");
    toast.success(`Transferência realizada para o clube ${transferClubeDestino}!`);
  };

  const handlePrintCredencial = () => {
    toast.info("Abrindo fila de impressão da credencial...");
    window.print();
  };

  // Filters
  const filteredList = list.filter((a) => {
    const matchesSearch =
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.registro.toLowerCase().includes(search.toLowerCase());
    const matchesSex = filterSex === "TODOS" || a.sexo === filterSex;
    const matchesStatus = filterStatus === "TODOS" || a.status === filterStatus;
    return matchesSearch && matchesSex && matchesStatus;
  });

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "registro":
        return <FileCheck className="h-4 w-4 text-sky-400" />;
      case "transferencia":
        return <Building className="h-4 w-4 text-warning" />;
      case "recorde":
        return <Award className="h-4 w-4 text-success animate-bounce" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Cadastro Nacional de Atletas"
        description="Ficha centralizada de atletas. Filiação, categorias e históricos de performance esportiva."
        action={
          canRegisterAthletes && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Registrar Atleta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Registrar Novo Atleta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome_atleta">Nome Completo</Label>
                    <Input
                      id="nome_atleta"
                      value={newNome}
                      onChange={(e) => setNewNome(e.target.value)}
                      placeholder="Ex: Gabriel Barbosa"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sexo_atleta">Sexo</Label>
                      <Select value={newSexo} onValueChange={(v: "M" | "F") => setNewSexo(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nasc_atleta">Data de Nascimento</Label>
                      <Input
                        id="nasc_atleta"
                        type="date"
                        value={newNasc}
                        onChange={(e) => setNewNasc(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nac_atleta">Nacionalidade</Label>
                      <Input
                        id="nac_atleta"
                        value={newNac}
                        onChange={(e) => setNewNac(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="clube_atleta">Clube Associado</Label>
                      <Input
                        id="clube_atleta"
                        value={newClube}
                        onChange={(e) => setNewClube(e.target.value)}
                        placeholder="Ex: SESI-SP"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar Atleta</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column: List and filter */}
        <div className="space-y-4">
          <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou nº de registro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={filterSex}
                  onChange={(e) => setFilterSex(e.target.value)}
                  className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="TODOS">Todos os gêneros</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="TODOS">Qualquer situação</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </Card>

          {/* Athlete Grid List */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredList.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAthlete(a)}
                className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                  selectedAthlete?.id === a.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/40 bg-card hover:bg-muted/30"
                }`}
              >
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={a.foto} />
                  <AvatarFallback>
                    <User className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={a.status === "Ativo" ? "default" : "destructive"}
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      {a.status}
                    </Badge>
                    <span className="text-[11px] font-bold text-sky-400">{a.registro}</span>
                  </div>
                  <h3 className="mt-1 font-bold text-foreground text-sm truncate">{a.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{a.clube}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {a.categoria} · {calculateAge(a.nascimento)} anos
                    </span>
                    <span className="font-semibold text-foreground">
                      {a.sexo === "M" ? "Masc" : "Fem"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Card */}
        <div>
          {selectedAthlete ? (
            <Card className="p-5 border-border/40 sticky top-20">
              <div className="flex flex-col items-center text-center border-b border-border/20 pb-5">
                <Avatar className="h-20 w-20 border-2 border-primary shadow-lg">
                  <AvatarImage src={selectedAthlete.foto} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-base font-bold text-foreground">{selectedAthlete.nome}</h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant="outline">{selectedAthlete.categoria}</Badge>
                  <Badge>{selectedAthlete.registro}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" /> {selectedAthlete.clube}
                </p>
              </div>

              <Tabs defaultValue="timeline" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="timeline" className="text-[10px] px-1">
                    História
                  </TabsTrigger>
                  <TabsTrigger value="transf" className="text-[10px] px-1">
                    Transf.
                  </TabsTrigger>
                  <TabsTrigger value="perf" className="text-[10px] px-1">
                    Tempos
                  </TabsTrigger>
                  <TabsTrigger value="credencial" className="text-[10px] px-1">
                    Ficha
                  </TabsTrigger>
                </TabsList>

                {/* Timeline Panel */}
                <TabsContent value="timeline" className="space-y-4 pt-3.5">
                  <div className="space-y-3.5">
                    {selectedAthlete.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-normal">
                        <div className="flex flex-col items-center">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border">
                            {getTimelineIcon(event.iconType)}
                          </span>
                          {idx !== selectedAthlete.timeline.length - 1 && (
                            <span className="w-0.5 flex-1 bg-border/40 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {event.data}
                          </span>
                          <h4 className="font-semibold text-foreground mt-0.5">{event.titulo}</h4>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            {event.descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Transferencias Panel */}
                <TabsContent value="transf" className="space-y-3 pt-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Clubes Anteriores:</span>
                    <span className="font-semibold">
                      {selectedAthlete.clubesAnteriores.length > 0
                        ? selectedAthlete.clubesAnteriores.join(", ")
                        : "Nenhum"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Histórico Oficial de Transferências
                    </h4>
                    {selectedAthlete.transferencias.length > 0 ? (
                      selectedAthlete.transferencias.map((t, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border/40 bg-muted/10 p-2.5 text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-foreground">
                              {t.origem} ➔ {t.destino}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Taxa: R$ {t.taxa} · {t.data}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {t.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic p-2 bg-muted/10 rounded">
                        Nenhuma transferência cadastrada.
                      </p>
                    )}
                  </div>

                  {role !== "Público" && (
                    <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full mt-2">
                          Transferir Atleta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Efetuar Transferência de Atleta</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleTransfer} className="space-y-4 pt-4">
                          <div>
                            <Label className="text-xs">Clube de Origem</Label>
                            <Input value={selectedAthlete.clube} disabled className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="clube_destino" className="text-xs">
                              Clube de Destino
                            </Label>
                            <Input
                              id="clube_destino"
                              value={transferClubeDestino}
                              onChange={(e) => setTransferClubeDestino(e.target.value)}
                              placeholder="Ex: Pinheiros"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsTransferDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit">Efetivar Transferência</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </TabsContent>

                {/* Performance Historico Panel */}
                <TabsContent value="perf" className="space-y-3 pt-3.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Melhores Tempos Homologados
                  </h4>
                  {selectedAthlete.resultadosHistoricos.length > 0 ? (
                    selectedAthlete.resultadosHistoricos.map((res, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center rounded-lg border border-border/40 p-2.5 text-xs bg-muted/10"
                      >
                        <div>
                          <p className="font-bold">{res.prova}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {res.competicao} · {res.data}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sky-400 text-sm tabular-nums">{res.tempo}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {res.colocacao}º lugar · {res.pontos} pts
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic p-2 bg-muted/10 rounded">
                      Nenhum tempo oficial indexado nesta temporada.
                    </p>
                  )}
                </TabsContent>

                {/* Credencial Digital Panel */}
                <TabsContent
                  value="credencial"
                  className="space-y-4 pt-3.5 flex flex-col items-center"
                >
                  <div className="w-64 rounded-xl border border-primary/20 bg-gradient-secondary p-4 text-white shadow-lg relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute right-0 bottom-0 opacity-10 font-bold text-6xl pointer-events-none select-none">
                      CBDA
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="leading-tight">
                        <p className="text-[10px] font-bold tracking-wider text-sky-200">
                          CREDENCIAL NACIONAL
                        </p>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">
                          Natação Competitiva
                        </p>
                      </div>
                      <IdCard className="h-6 w-6 text-sky-300" />
                    </div>

                    <div className="mt-4 flex items-center gap-3.5">
                      <Avatar className="h-14 w-14 border border-white/20">
                        <AvatarImage src={selectedAthlete.foto} />
                        <AvatarFallback className="bg-white/10 text-white">
                          <User />
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight min-w-0">
                        <p className="font-bold text-sm truncate">{selectedAthlete.nome}</p>
                        <p className="text-xs text-slate-200 mt-1 truncate">
                          {selectedAthlete.clube}
                        </p>
                        <p className="text-[10px] text-sky-200 font-semibold mt-0.5">
                          {selectedAthlete.registro}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 flex justify-between text-[10px]">
                      <div>
                        <span className="text-slate-300 block text-[9px]">Categoria</span>
                        <span className="font-bold">{selectedAthlete.categoria}</span>
                      </div>
                      <div>
                        <span className="text-slate-300 block text-[9px]">Gênero</span>
                        <span className="font-bold">
                          {selectedAthlete.sexo === "M" ? "Masculino" : "Feminino"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-300 block text-[9px]">Validade</span>
                        <span className="font-bold text-green-300">DEZ/2026</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintCredencial}
                    className="w-full"
                  >
                    <Printer className="mr-1.5 h-4 w-4" /> Imprimir Credencial Fila
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm text-muted-foreground">
              Selecione um atleta para exibir a ficha de rendimento nacional.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

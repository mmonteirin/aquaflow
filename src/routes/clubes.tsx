import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  MapPin,
  Building,
  FileCheck,
  CreditCard,
  Search,
  UploadCloud,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderOpen,
  Filter,
  List,
  LayoutGrid,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clubs as initialClubs, Club, ClubDocument } from "@/lib/data";
import { useRBAC } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/clubes")({
  head: () => ({
    meta: [
      { title: "Entidades & Clubes — AquaFlow" },
      { name: "description", content: "Cadastro de federações, clubes, academias e equipes com controle cadastral e anuidades." },
    ],
  }),
  component: ClubesManager,
});

function ClubesManager() {
  const { role, canManageCompetitions } = useRBAC();
  const [list, setList] = useState<Club[]>(initialClubs);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("TODOS");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [selectedClub, setSelectedClub] = useState<Club | null>(initialClubs[0]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Form states for new Entity
  const [newNome, setNewNome] = useState("");
  const [newSigla, setNewSigla] = useState("");
  const [newTipo, setNewTipo] = useState<"Clube" | "Federação" | "Academia" | "Equipe">("Clube");
  const [newFederacao, setNewFederacao] = useState("");
  const [newCidade, setNewCidade] = useState("");
  const [newEstado, setNewEstado] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Document upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"Estatuto" | "Contrato" | "Ata" | "Certidão">("Estatuto");
  const [docName, setDocName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newSigla) {
      toast.error("Por favor, preencha o nome e a sigla.");
      return;
    }

    const created: Club = {
      id: (list.length + 1).toString(),
      nome: newNome,
      sigla: newSigla.toUpperCase(),
      tipo: newTipo,
      federacao: newFederacao || "CBDA",
      cidade: newCidade || "Belo Horizonte",
      estado: (newEstado || "MG").toUpperCase(),
      pais: "Brasil",
      atletas: 0,
      situacao: "Pendente",
      anuidadeStatus: "Pendente",
      anuidadeVencimento: "2027-01-01",
      anuidadeValor: newTipo === "Federação" ? 2500 : 1500,
      documentos: [],
    };

    setList([created, ...list]);
    setSelectedClub(created);
    setIsDialogOpen(false);
    toast.success("Entidade cadastrada com sucesso! Situação: Pendente de homologação.");
    
    // Clear inputs
    setNewNome("");
    setNewSigla("");
    setNewFederacao("");
    setNewCidade("");
    setNewEstado("");
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;
    if (!docName) {
      toast.error("Insira o nome do documento.");
      return;
    }

    const newDoc: ClubDocument = {
      id: "doc-" + Date.now(),
      nome: docName,
      tipo: docType,
      dataEnvio: new Date().toISOString().split("T")[0],
      status: "Em Análise",
    };

    const updatedClubs = list.map((c) => {
      if (c.id === selectedClub.id) {
        const docList = [...c.documentos, newDoc];
        return { ...c, documentos: docList };
      }
      return c;
    });

    setList(updatedClubs);
    setSelectedClub({ ...selectedClub, documentos: [...selectedClub.documentos, newDoc] });
    setDocName("");
    setUploadedFile(null);
    toast.success(`Documento "${docName}" enviado para análise!`);
  };

  const handleApproveDocument = (docId: string) => {
    if (!selectedClub) return;
    const updatedDocs = selectedClub.documentos.map((d) =>
      d.id === docId ? { ...d, status: "Homologado" as const } : d
    );
    const updatedClubs = list.map((c) =>
      c.id === selectedClub.id ? { ...c, documentos: updatedDocs } : c
    );
    setList(updatedClubs);
    setSelectedClub({ ...selectedClub, documentos: updatedDocs });
    toast.success("Documento homologado com sucesso!");
  };

  const handleToggleStatus = (status: "Ativo" | "Pendente" | "Suspenso") => {
    if (!selectedClub) return;
    const updatedClubs = list.map((c) =>
      c.id === selectedClub.id ? { ...c, situacao: status } : c
    );
    setList(updatedClubs);
    setSelectedClub({ ...selectedClub, situacao: status });
    toast.success(`Situação cadastral alterada para: ${status}`);
  };

  const handlePayAnnuity = () => {
    if (!selectedClub) return;
    const updatedClubs = list.map((c) =>
      c.id === selectedClub.id ? { ...c, anuidadeStatus: "Pago" as const } : c
    );
    setList(updatedClubs);
    setSelectedClub({ ...selectedClub, anuidadeStatus: "Pago" });
    toast.success(`Anuidade quitada com sucesso!`);
  };

  // Filter list
  const filteredList = list.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.sigla.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "TODOS" || c.tipo === filterType;
    const matchesStatus = filterStatus === "TODOS" || c.situacao === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ativo":
      case "Pago":
      case "Homologado":
        return <CheckCircle className="h-4.5 w-4.5 text-success" />;
      case "Pendente":
      case "Em Análise":
        return <Clock className="h-4.5 w-4.5 text-warning animate-pulse" />;
      default:
        return <AlertTriangle className="h-4.5 w-4.5 text-destructive" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Ativo":
      case "Pago":
      case "Homologado":
        return "default";
      case "Pendente":
      case "Em Análise":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Entidades & Clubes"
        description="Gestão de Confederações, Federações estaduais, Clubes esportivos, Academias e Equipes."
        action={
          canManageCompetitions && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nova Entidade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Entidade Aquática</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={newNome}
                        onChange={(e) => setNewNome(e.target.value)}
                        placeholder="Ex: Minas Tênis Clube"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sigla">Sigla / Abreviação</Label>
                      <Input
                        id="sigla"
                        value={newSigla}
                        onChange={(e) => setNewSigla(e.target.value)}
                        placeholder="Ex: MTC"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tipo">Tipo de Entidade</Label>
                      <Select
                        value={newTipo}
                        onValueChange={(v: any) => setNewTipo(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Federação">Federação Estadual</SelectItem>
                          <SelectItem value="Clube">Clube Esportivo</SelectItem>
                          <SelectItem value="Academia">Academia filiada</SelectItem>
                          <SelectItem value="Equipe">Equipe Independente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="federacao">Federação Vinculada</Label>
                      <Input
                        id="federacao"
                        value={newFederacao}
                        onChange={(e) => setNewFederacao(e.target.value)}
                        placeholder="Ex: FAM-MG"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={newCidade}
                        onChange={(e) => setNewCidade(e.target.value)}
                        placeholder="Ex: Belo Horizonte"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="estado">Estado (UF)</Label>
                      <Input
                        id="estado"
                        value={newEstado}
                        onChange={(e) => setNewEstado(e.target.value)}
                        placeholder="Ex: MG"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar Entidade</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Filter and List */}
        <div className="space-y-4">
          <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou sigla..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filter controls */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="TODOS">Todos os tipos</option>
                  <option value="Federação">Federações</option>
                  <option value="Clube">Clubes</option>
                  <option value="Academia">Academias</option>
                  <option value="Equipe">Equipes</option>
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="TODOS">Qualquer situação</option>
                <option value="Ativo">Ativo</option>
                <option value="Pendente">Pendente</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </div>
          </Card>

          {/* View toggle */}
          <div className="flex justify-end">
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("table")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List of entities */}
          {viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2">
            {filteredList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClub(c)}
                className={`flex flex-col justify-between rounded-xl border p-4.5 text-left transition-all ${
                  selectedClub?.id === c.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/40 bg-card hover:bg-muted/30"
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="outline">{c.tipo}</Badge>
                    <span className="flex items-center gap-1 text-xs">
                      {getStatusIcon(c.situacao)}
                      <span className="font-semibold">{c.situacao}</span>
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-foreground text-base leading-tight">
                    {c.nome} ({c.sigla})
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {c.cidade}/{c.estado}
                  </p>
                </div>
                <div className="mt-4 pt-3.5 border-t border-border/20 flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span>Atletas inscritos: <strong className="text-foreground">{c.atletas}</strong></span>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-sky-400">
                    {c.federacao}
                  </span>
                </div>
              </button>
            ))}
            </div>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/20">
                    <th className="px-4 py-3.5">Nome / Sigla</th>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Localização</th>
                    <th className="px-4 py-3.5">Federação</th>
                    <th className="px-4 py-3.5">Atletas</th>
                    <th className="px-4 py-3.5 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedClub(c)}
                      className={`border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer ${
                        selectedClub?.id === c.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{c.nome}</div>
                        <div className="text-xs text-muted-foreground">{c.sigla}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline">{c.tipo}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{c.cidade}/{c.estado}</td>
                      <td className="px-4 py-3.5 text-xs text-sky-400">{c.federacao}</td>
                      <td className="px-4 py-3.5">{c.atletas}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1">
                          {getStatusIcon(c.situacao)}
                          <span className="font-semibold text-xs">{c.situacao}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Right Side: Detail Panel */}
        <div className="space-y-4">
          {selectedClub ? (
            <Card className="p-5 border-border/40 sticky top-20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <div className="leading-tight">
                  <h2 className="text-lg font-bold text-foreground">{selectedClub.nome}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Sigla: <strong className="text-foreground">{selectedClub.sigla}</strong> · {selectedClub.tipo}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-border/20 py-3">
                <div>
                  <span className="text-muted-foreground block">Federação Vinculada</span>
                  <span className="font-bold">{selectedClub.federacao}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Localização</span>
                  <span className="font-bold">{selectedClub.cidade} - {selectedClub.estado}</span>
                </div>
              </div>

              <Tabs defaultValue="cadastral" className="mt-5">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cadastral" className="text-xs">Cadastro</TabsTrigger>
                  <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
                  <TabsTrigger value="docs" className="text-xs">Documentos</TabsTrigger>
                </TabsList>

                {/* Cadastral Panel */}
                <TabsContent value="cadastral" className="space-y-4 pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Situação Cadastral
                    </h4>
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                      {getStatusIcon(selectedClub.situacao)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{selectedClub.situacao}</p>
                        <p className="text-[10px] text-muted-foreground">Licenciamento vigente até Dez/2026</p>
                      </div>
                    </div>
                  </div>

                  {role !== "Público" && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Ações Administrativas
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-success/10 text-success hover:bg-success/20 border-success/20"
                          onClick={() => handleToggleStatus("Ativo")}
                        >
                          Ativar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-warning/10 text-warning hover:bg-warning/20 border-warning/20"
                          onClick={() => handleToggleStatus("Pendente")}
                        >
                          Pendente
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                          onClick={() => handleToggleStatus("Suspenso")}
                        >
                          Suspender
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Financeiro Panel */}
                <TabsContent value="financeiro" className="space-y-4 pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status da Anuidade
                    </h4>
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold">Anuidade Escolar</p>
                          <p className="text-[10px] text-muted-foreground">Vencimento: {selectedClub.anuidadeVencimento}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(selectedClub.anuidadeStatus)}>
                        {selectedClub.anuidadeStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Valor Cobrado:</span>
                    <span className="font-bold text-base">R$ {selectedClub.anuidadeValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {selectedClub.anuidadeStatus !== "Pago" && (
                    <Button onClick={handlePayAnnuity} className="w-full">
                      Confirmar Pagamento Simulado
                    </Button>
                  )}
                </TabsContent>

                {/* Documentos Panel */}
                <TabsContent value="docs" className="space-y-4 pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Fichas e Documentos Homologados
                    </h4>
                    <div className="space-y-2">
                      {selectedClub.documentos.length > 0 ? (
                        selectedClub.documentos.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5 text-xs bg-muted/10">
                            <div>
                              <p className="font-semibold text-foreground">{doc.nome}</p>
                              <p className="text-[10px] text-muted-foreground">{doc.tipo} · Enviado em {doc.dataEnvio}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                {getStatusIcon(doc.status)}
                                <span className="font-bold text-[10px]">{doc.status}</span>
                              </span>
                              {doc.status === "Em Análise" && role !== "Público" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveDocument(doc.id)}
                                >
                                  Aprovar
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic p-2 bg-muted/10 rounded">Nenhum documento anexado.</p>
                      )}
                    </div>
                  </div>

                  {/* Uploader Mock */}
                  <form onSubmit={handleUploadDoc} className="rounded-xl border border-dashed border-border p-4.5 space-y-3.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <UploadCloud className="h-4 w-4 text-primary animate-bounce" /> Enviar Novo Documento
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <Label htmlFor="doc_name" className="text-[11px]">Nome do arquivo/doc</Label>
                        <Input
                          id="doc_name"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="Ex: Certificado de Regularidade"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Tipo</Label>
                        <select
                          value={docType}
                          onChange={(e: any) => setDocType(e.target.value)}
                          className="w-full mt-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8 focus:outline-none"
                        >
                          <option value="Estatuto">Estatuto</option>
                          <option value="Contrato">Contrato</option>
                          <option value="Ata">Ata</option>
                          <option value="Certidão">Certidão</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" size="sm" className="w-full h-8 text-xs">
                          Anexar
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm text-muted-foreground">
              Selecione uma entidade esportiva para ver o painel completo.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

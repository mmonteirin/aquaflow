import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  ClipboardList,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CreditCard,
  QrCode,
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Users,
  RefreshCw,
  Settings,
  Building2,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/lib/rbac";
import { athletes, clubs } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/inscricoes")({
  head: () => ({
    meta: [
      { title: "Inscrições Online — AquaFlow" },
      { name: "description", content: "Portal de inscrições de natação com validação automática de índices e pagamentos." },
    ],
  }),
  component: InscricoesManager,
});

interface AthleteRegistration {
  id: string;
  nome: string;
  nascimento: string;
  idade: number;
  genero: string;
  clube: string;
  licenca: string;
  registro?: string;
  pagamento: string;
  pagamentoId: string;
  status: string;
}

interface RelayRegistration {
  id: string;
  nome?: string;
  clube: string;
  categoria: string;
  prova: string;
  atletas?: string[];
  pagamento: string;
  pagamentoId: string;
  status: string;
}

const initialAthletes: AthleteRegistration[] = [
  { 
    id: "1", 
    nome: "Mateus Monteiro da Cruz", 
    nascimento: "2008-03-15", 
    idade: 18, 
    genero: "M", 
    clube: "Associação Aquática Praia Clube", 
    licenca: "CBDA-2024-001234", 
    pagamento: "PAGO", 
    pagamentoId: "PAY-789456", 
    status: "Confirmado" 
  },
  { 
    id: "2", 
    nome: "Ana Clara Souza", 
    nascimento: "2009-07-22", 
    idade: 16, 
    genero: "F", 
    clube: "Minas Tênis Clube", 
    licenca: "CBDA-2024-005678", 
    pagamento: "AGUARDANDO", 
    pagamentoId: "PAY-789457", 
    status: "Pendente" 
  },
  { 
    id: "3", 
    nome: "Lucas Oliveira", 
    nascimento: "2007-11-08", 
    idade: 18, 
    genero: "M", 
    clube: "SESI-SP", 
    licenca: "CBDA-2024-009012", 
    pagamento: "PAGO", 
    pagamentoId: "PAY-789458", 
    status: "Confirmado" 
  },
];

const initialRelays: RelayRegistration[] = [
  { 
    id: "1", 
    clube: "Minas Tênis Clube", 
    categoria: "4x50m Livre", 
    prova: "Revezamento 4x50m Livre", 
    pagamento: "PAGO", 
    pagamentoId: "PAY-789459", 
    status: "Confirmado" 
  },
];

// Qualifying indices for Troféu Brasil (Mock Index)
const QUALIFYING_TIMES: Record<string, string> = {
  "50m Livre M": "00:23.10",
  "100m Livre M": "00:50.50",
  "100m Costas M": "00:57.20",
  "200m Medley M": "02:06.00",
  "100m Borboleta F": "01:02.30",
  "200m Peito F": "02:35.00",
};

// Helper to convert time "MM:SS.hh" to float seconds
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.match(/(?:(\d+):)?(\d+)\.(\d+)/);
  if (!parts) return 9999;
  const mins = parts[1] ? parseInt(parts[1], 10) : 0;
  const secs = parseInt(parts[2], 10);
  const ms = parseInt(parts[3], 10) / 100;
  return mins * 60 + secs + ms;
}

function InscricoesManager() {
  const { role } = useRBAC();
  const [athletes, setAthletes] = useState<AthleteRegistration[]>(initialAthletes);
  const [relays, setRelays] = useState<RelayRegistration[]>(initialRelays);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("atletas");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRegistration | null>(initialAthletes[0]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Wizard form states
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [selectedProva, setSelectedProva] = useState("100m Livre M");
  const [entryTime, setEntryTime] = useState("");
  const [piscina, setPiscina] = useState("50m");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "boleto">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");

  const wizardSelectedAthlete = athletes.find((a) => a.id === selectedAthleteId);
  const athleteClub = wizardSelectedAthlete ? clubs.find((c) => c.nome === wizardSelectedAthlete.clube) : null;

  // Real-time validations
  const validationAge = wizardSelectedAthlete ? (new Date().getFullYear() - new Date(wizardSelectedAthlete.nascimento).getFullYear()) : 0;
  const validationClubActive = athleteClub?.situacao === "Ativo";
  const validationClubFinances = athleteClub?.anuidadeStatus === "Pago";
  const validationAthleteEligible = wizardSelectedAthlete?.status === "Ativo";

  // Index validation
  const indexRequired = QUALIFYING_TIMES[selectedProva];
  const timeSecs = entryTime ? timeToSeconds(entryTime) : 9999;
  const indexSecs = indexRequired ? timeToSeconds(indexRequired) : 0;
  const validationIndexPassed = entryTime ? timeSecs <= indexSecs : false;

  const totalValid =
    validationClubActive &&
    validationClubFinances &&
    validationAthleteEligible &&
    validationIndexPassed;

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!selectedAthleteId) {
        toast.error("Por favor, selecione um atleta.");
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!entryTime || !/^\d{2}:\d{2}\.\d{2}$/.test(entryTime)) {
        toast.error("Por favor, insira o tempo no formato MM:SS.hh (Ex: 00:51.20).");
        return;
      }
      setWizardStep(3);
    }
  };

  const handleProcessPayment = () => {
    if (paymentMethod === "cartao" && (!cardNumber || !cardName)) {
      toast.error("Preencha todos os campos do cartão.");
      return;
    }

    // Success simulation
    const newReg: AthleteRegistration = {
      id: Date.now().toString(),
      nome: wizardSelectedAthlete!.nome,
      nascimento: wizardSelectedAthlete!.nascimento,
      idade: wizardSelectedAthlete!.idade,
      genero: wizardSelectedAthlete!.genero,
      clube: wizardSelectedAthlete!.clube,
      licenca: wizardSelectedAthlete!.licenca,
      pagamento: "PAGO",
      pagamentoId: "PAY-" + Date.now(),
      status: "Confirmado"
    };

    setAthletes([newReg, ...athletes]);
    setIsWizardOpen(false);
    // reset wizard
    setWizardStep(1);
    setSelectedAthleteId("");
    setEntryTime("");
    toast.success("Pagamento confirmado e inscrição efetuada com sucesso!");
  };

  const filteredAthletes = athletes.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.clube.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Inscrições Online"
        description="Painel de inscrições para competições ativas. Checagem eletrônica de requisitos CBDA/FINA."
        action={
          role !== "Público" && (
            <Dialog open={isWizardOpen} onOpenChange={(open) => { setIsWizardOpen(open); if(!open) setWizardStep(1); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nova Inscrição
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Ficha de Inscrição Eletrônica — Passo {wizardStep} de 3
                  </DialogTitle>
                </DialogHeader>

                {/* Step 1: Selection */}
                {wizardStep === 1 && (
                  <div className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Selecionar Atleta Cadastrado</Label>
                      <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
                        <SelectTrigger className="bg-slate-950 border-slate-800">
                          <SelectValue placeholder="Selecione o atleta..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {athletes.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.nome} ({a.registro} - {a.clube})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedAthlete && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 space-y-2 text-xs">
                        <h4 className="font-bold text-sky-400">Verificação Cadastral do Atleta:</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Situação Cadastral:</span>
                          <Badge variant={validationAthleteEligible ? "default" : "destructive"}>
                            {selectedAthlete.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Ano Nascimento / Idade:</span>
                          <span className="font-semibold">{selectedAthlete.nascimento.split("-")[0]} ({validationAge} anos)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Clube de Origem:</span>
                          <span className="font-semibold">{selectedAthlete.clube}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Regularidade Cadastral Clube:</span>
                          <span className={`font-semibold ${validationClubActive ? "text-success" : "text-destructive"}`}>
                            {validationClubActive ? "Ativo" : "Pendente/Inativo"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Anuidade Clube Quitado:</span>
                          <span className={`font-semibold ${validationClubFinances ? "text-success" : "text-destructive"}`}>
                            {validationClubFinances ? "Pago" : "Débito Pendente"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button onClick={handleNextStep} disabled={!selectedAthlete}>
                        Avançar <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Prova & Tempo */}
                {wizardStep === 2 && (
                  <div className="space-y-4 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-300">Prova da Inscrição</Label>
                        <Select value={selectedProva} onValueChange={setSelectedProva}>
                          <SelectTrigger className="bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="50m Livre M">50m Livre M</SelectItem>
                            <SelectItem value="100m Livre M">100m Livre M</SelectItem>
                            <SelectItem value="100m Costas M">100m Costas M</SelectItem>
                            <SelectItem value="200m Medley M">200m Medley M</SelectItem>
                            <SelectItem value="100m Borboleta F">100m Borboleta F</SelectItem>
                            <SelectItem value="200m Peito F">200m Peito F</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-300">Extensão Piscina</Label>
                        <Select value={piscina} onValueChange={setPiscina}>
                          <SelectTrigger className="bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Escolha" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="25m">25 metros (Curta)</SelectItem>
                            <SelectItem value="50m">50 metros (Olímpica)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-slate-300">Tempo de Balizamento (MM:SS.hh)</Label>
                        <Input
                          value={entryTime}
                          onChange={(e) => setEntryTime(e.target.value)}
                          placeholder="Ex: 00:49.80"
                          className="bg-slate-950 border-slate-800 tabular-nums text-white"
                        />
                        <p className="text-[10px] text-slate-400">Insira a melhor marca oficial homologada do atleta nos últimos 12 meses.</p>
                      </div>
                    </div>

                    {entryTime && (
                      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs space-y-2">
                        <h4 className="font-bold text-sky-400">Validação de Índices CBDA:</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Índice Mínimo Exigido:</span>
                          <span className="font-mono">{indexRequired || "Nenhum"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Marca Declarada:</span>
                          <span className="font-mono text-foreground">{entryTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Resultado da Validação:</span>
                          {validationIndexPassed ? (
                            <Badge className="bg-success text-white border-0">Índice Atingido</Badge>
                          ) : (
                            <Badge variant="destructive">Abaixo do Índice</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      <Button variant="outline" className="border-slate-800" onClick={() => setWizardStep(1)}>
                        Voltar
                      </Button>
                      <Button onClick={handleNextStep} disabled={!entryTime}>
                        Avançar <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Pagamento */}
                {wizardStep === 3 && (
                  <div className="space-y-4 pt-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs space-y-2">
                      <h4 className="font-bold text-sky-400">Resumo da Inscrição:</h4>
                      <div className="flex justify-between"><span className="text-slate-400">Atleta:</span><span className="font-bold">{selectedAthlete?.nome}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Prova:</span><span className="font-bold">{selectedProva}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Tempo Declarado:</span><span className="font-bold font-mono">{entryTime}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Validações FINA:</span>
                        <span className={totalValid ? "text-success font-bold" : "text-warning font-bold flex items-center gap-1"}>
                          {totalValid ? (
                            "Elegibilidade OK"
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" /> Advertência Cadastral
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <Label className="text-slate-300">Escolha o Método de Pagamento</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={paymentMethod === "pix" ? "default" : "outline"}
                          className="h-9 border-slate-800 flex items-center justify-center gap-1.5"
                          onClick={() => setPaymentMethod("pix")}
                        >
                          <QrCode className="h-4 w-4" /> PIX
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === "cartao" ? "default" : "outline"}
                          className="h-9 border-slate-800 flex items-center justify-center gap-1.5"
                          onClick={() => setPaymentMethod("cartao")}
                        >
                          <CreditCard className="h-4 w-4" /> Cartão
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === "boleto" ? "default" : "outline"}
                          className="h-9 border-slate-800 flex items-center justify-center gap-1.5"
                          onClick={() => setPaymentMethod("boleto")}
                        >
                          <FileText className="h-4 w-4" /> Boleto
                        </Button>
                      </div>
                    </div>

                    {/* Method details */}
                    {paymentMethod === "pix" && (
                      <div className="flex flex-col items-center gap-3.5 border border-slate-800 rounded-lg p-4 bg-slate-950/20 text-center">
                        <div className="bg-white p-2 rounded-lg">
                          {/* Simulated QR Code placeholder using CSS */}
                          <div className="h-32 w-32 bg-slate-900 flex items-center justify-center text-[10px] text-sky-400 font-bold border-2 border-primary">
                            [QR CODE PIX]
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">Valor da Inscrição: R$ 85,00</p>
                          <p className="text-slate-400 text-[10px]">Escaneie o código acima no app do seu banco ou utilize a chave PIX CNPJ da CBDA.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cartao" && (
                      <div className="space-y-3 border border-slate-800 rounded-lg p-4 bg-slate-950/20 text-xs">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-300">Número do Cartão</Label>
                          <Input
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-8"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-300">Validade</Label>
                            <Input placeholder="MM/AA" className="bg-slate-950 border-slate-800 h-8" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-slate-300">CVV</Label>
                            <Input placeholder="123" className="bg-slate-950 border-slate-800 h-8" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-300">Nome Impresso</Label>
                          <Input
                            placeholder="Ex: JOAO SILVA"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="bg-slate-950 border-slate-800 h-8"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "boleto" && (
                      <div className="flex flex-col items-center justify-center p-5 border border-slate-800 bg-slate-950/20 rounded-lg text-center gap-3">
                        <FileText className="h-10 w-10 text-primary animate-pulse" />
                        <div className="text-xs">
                          <p className="font-semibold text-white">Boleto Bancário</p>
                          <p className="text-slate-400 text-[10px] mt-1">Taxa gerada. Faça o download para pagamento em até 48 horas.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="border-slate-800"
                          onClick={() => toast.success("Boleto PDF baixado com sucesso!")}
                        >
                          Baixar Boleto PDF
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-slate-800">
                      <Button variant="outline" className="border-slate-800" onClick={() => setWizardStep(2)}>
                        Voltar
                      </Button>
                      <Button onClick={handleProcessPayment} className="bg-primary hover:bg-primary/95 text-white">
                        Confirmar Pagamento
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {/* Search */}
          <Card className="p-4 border-border/40 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar inscrições por nome de atleta ou clube..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="clubes">Clubes</TabsTrigger>
            <TabsTrigger value="atletas">Atletas</TabsTrigger>
            <TabsTrigger value="revezamentos">Revezamentos</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="clubes" className="space-y-4 mt-4">
            <Card className="p-8 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Gerenciamento de Clubes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie os clubes participantes da competição, incluindo status de pagamento e atletas cadastrados.
              </p>
              <Button variant="outline">Ver Clubes</Button>
            </Card>
          </TabsContent>

          <TabsContent value="atletas" className="space-y-4 mt-4">
            {/* List of athlete entries */}
            <Card className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/20">
                    <th className="px-4 py-3.5">Atleta / Clube</th>
                    <th className="px-4 py-3.5">Nascimento</th>
                    <th className="px-4 py-3.5">Idade</th>
                    <th className="px-4 py-3.5">Gênero</th>
                    <th className="px-4 py-3.5">Licença</th>
                    <th className="px-4 py-3.5">Pagamento</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAthletes.map((a, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10 cursor-pointer" onClick={() => setSelectedAthlete(a)}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{a.nome}</div>
                        <div className="text-xs text-muted-foreground">{a.clube}</div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">{new Date(a.nascimento).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3.5">{a.idade}</td>
                      <td className="px-4 py-3.5">{a.genero}</td>
                      <td className="px-4 py-3.5 text-xs font-mono">{a.licenca}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-mono">{a.pagamentoId}</div>
                        <Badge className={a.pagamento === "PAGO" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"}>
                          {a.pagamento}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={a.status === "Confirmado" ? "default" : "secondary"}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredAthletes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                        Nenhuma inscrição encontrada para a busca realizada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="revezamentos" className="space-y-4 mt-4">
            {/* List of relay entries */}
            <Card className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/20">
                    <th className="px-4 py-3.5">Revezamento / Clube</th>
                    <th className="px-4 py-3.5">Atletas</th>
                    <th className="px-4 py-3.5">Prova</th>
                    <th className="px-4 py-3.5">Pagamento</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {relays.map((r, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{r.nome}</div>
                        <div className="text-xs text-muted-foreground">{r.clube}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">{(r.atletas ?? []).join(", ")}</td>
                      <td className="px-4 py-3.5">{r.prova}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-mono">{r.pagamentoId}</div>
                        <Badge className={r.pagamento === "PAGO" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"}>
                          {r.pagamento}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={r.status === "Confirmado" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {relays.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                        Nenhum revezamento cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-4 mt-4">
            <Card className="p-8 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Pedidos de Inscrição</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visualize e gerencie os pedidos de inscrição pendentes de aprovação.
              </p>
              <Button variant="outline">Ver Pedidos</Button>
            </Card>
          </TabsContent>
        </Tabs>
        </div>

        {/* Right Sidebar - Athlete Details */}
        {selectedAthlete && (
          <Card className="w-80 h-fit p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Detalhes do Atleta</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAthlete(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <p className="font-medium">{selectedAthlete.nome}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Clube</Label>
                <p className="font-medium">{selectedAthlete.clube}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Idade</Label>
                  <p className="font-medium">{selectedAthlete.idade}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Gênero</Label>
                  <p className="font-medium">{selectedAthlete.genero}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Licença</Label>
                <p className="font-mono text-sm">{selectedAthlete.licenca}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pagamento</Label>
                <div className="flex items-center gap-2">
                  <Badge className={selectedAthlete.pagamento === "PAGO" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"}>
                    {selectedAthlete.pagamento}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">{selectedAthlete.pagamentoId}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge variant={selectedAthlete.status === "Confirmado" ? "default" : "secondary"}>
                  {selectedAthlete.status}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">Provas Inscritas</h4>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">100m Livre M</div>
                <div className="text-sm text-muted-foreground">200m Medley M</div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Editar Inscrição
            </Button>
          </Card>
        )}
      </div>

      {/* Change Log and Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Change Log</h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-foreground">15/01/2025</div>
              <div className="text-muted-foreground">Adicionada validação de índice CBDA</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-foreground">10/01/2025</div>
              <div className="text-muted-foreground">Integração com gateway de pagamento</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-foreground">05/01/2025</div>
              <div className="text-muted-foreground">Sistema de inscrições inicial</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Configurações</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Validação automática de índice</Label>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Pagamento obrigatório</Label>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Limite de provas por atleta</Label>
              <span className="text-sm text-muted-foreground">5</span>
            </div>
            <Button variant="outline" className="w-full mt-2">
              Editar Configurações
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

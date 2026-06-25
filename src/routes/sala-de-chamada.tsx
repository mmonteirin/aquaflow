import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ScanLine,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Search,
  UserCheck,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRBAC } from "@/lib/rbac";
import { callRoom as initialCallRoom } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/sala-de-chamada")({
  head: () => ({
    meta: [
      { title: "Sala de Chamada Digital — AquaFlow" },
      { name: "description", content: "Check-in de atletas na sala de chamada eletrônica e conformidade de trajes FINA." },
    ],
  }),
  component: SalaChamadaManager,
});

interface CallRoomAthlete {
  atleta: string;
  clube: string;
  prova: string;
  serie: number;
  raia: number;
  status: string;
  qrCodeId: string;
  traje: string;
  equipamento: string;
}

function SalaChamadaManager() {
  const { role } = useRBAC();
  const [swimmers, setSwimmers] = useState<CallRoomAthlete[]>(initialCallRoom);
  const [manualQr, setManualQr] = useState("");

  const presentes = swimmers.filter((c) => c.status === "Presente").length;
  const ausentes = swimmers.filter((c) => c.status === "Ausente").length;
  const aguardando = swimmers.filter((c) => c.status === "Aguardando").length;

  const handleScanQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQr) {
      toast.error("Insira o código de barras ou ID da credencial.");
      return;
    }

    const athlete = swimmers.find(
      (s) => s.qrCodeId.toLowerCase() === manualQr.toLowerCase() || s.atleta.toLowerCase().includes(manualQr.toLowerCase())
    );

    if (athlete) {
      if (athlete.status === "Presente") {
        toast.info(`${athlete.atleta} já realizou o check-in.`);
        setManualQr("");
        return;
      }

      setSwimmers(
        swimmers.map((s) =>
          s.qrCodeId === athlete.qrCodeId
            ? { ...s, status: "Presente", traje: "Homologado", equipamento: "Aprovado" }
            : s
        )
      );
      toast.success(`Check-in confirmado via QR Code: ${athlete.atleta}!`);
      setManualQr("");
    } else {
      toast.error("Nenhum atleta balizado correspondente a esta credencial.");
    }
  };

  const handleAction = (qrCodeId: string, status: "Presente" | "Ausente" | "Aguardando") => {
    setSwimmers(swimmers.map((s) => (s.qrCodeId === qrCodeId ? { ...s, status } : s)));
    toast.info(`Status de chamada alterado para ${status}`);
  };

  const handleVerifyTraje = (qrCodeId: string, status: "Homologado" | "Não Apresentado" | "Revisar") => {
    setSwimmers(swimmers.map((s) => (s.qrCodeId === qrCodeId ? { ...s, traje: status } : s)));
    toast.success(`Verificação de traje: ${status}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Presente":
      case "Homologado":
      case "Aprovado":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Aguardando":
      case "Verificando":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Presente":
        return "text-success bg-success/15 border-success/30";
      case "Aguardando":
        return "text-warning bg-warning/15 border-warning/30";
      default:
        return "text-destructive bg-destructive/15 border-destructive/30";
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Sala de Chamada Digital"
        description="Check-in digital, controle de touca/óculos e validação de trajes oficiais regulamento World Aquatics."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Check-in board and List */}
        <div className="space-y-4">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Presentes na Série", value: presentes, cls: "text-success border-success/20 bg-success/5" },
              { label: "Aguardando Chamada", value: aguardando, cls: "text-warning border-warning/20 bg-warning/5" },
              { label: "Ausentes / DNS", value: ausentes, cls: "text-destructive border-destructive/20 bg-destructive/5" },
            ].map((s) => (
              <Card key={s.label} className={`p-4 text-center ${s.cls}`}>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </Card>
            ))}
          </div>

          {/* List Swimmers in Call Room */}
          <Card className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Raia / Atleta</th>
                  <th className="px-3 py-3">Clube</th>
                  <th className="px-3 py-3">Status Chamada</th>
                  <th className="px-3 py-3">Traje FINA</th>
                  <th className="px-3 py-3">Cap/Óculos</th>
                  {role !== "Público" && <th className="px-4 py-3 text-right">Controles</th>}
                </tr>
              </thead>
              <tbody>
                {swimmers.map((s) => (
                  <tr key={s.qrCodeId} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-bold">
                          {s.raia}
                        </span>
                        <div>
                          <p className="font-semibold">{s.atleta}</p>
                          <p className="text-[11px] text-muted-foreground">Credencial: {s.qrCodeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground font-medium">{s.clube}</td>
                    <td className="px-3 py-3.5">
                      <Badge className={getStatusClass(s.status)} variant="outline">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        {getStatusIcon(s.traje)} {s.traje}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        {getStatusIcon(s.equipamento)} {s.equipamento}
                      </span>
                    </td>
                    {role !== "Público" && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-success/15 border-success/35 text-success hover:bg-success/20 h-7"
                            onClick={() => handleAction(s.qrCodeId, "Presente")}
                          >
                            Presença
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-destructive/15 border-destructive/35 text-destructive hover:bg-destructive/20 h-7"
                            onClick={() => handleAction(s.qrCodeId, "Ausente")}
                          >
                            Ausente
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Side: QR Code Scanner and Compliance */}
        <div className="space-y-4">
          {/* QR Code Scanner Emulator */}
          {role !== "Público" && (
            <Card className="p-5 border-border/40">
              <div className="flex items-center gap-2 mb-3.5">
                <ScanLine className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">Leitor de Credencial (Simulador)</h3>
              </div>
              <form onSubmit={handleScanQr} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">ID do QR Code / Sobrenome do Atleta</Label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ex: QR-ATH-003 ou Silva"
                      value={manualQr}
                      onChange={(e) => setManualQr(e.target.value)}
                      className="pl-9 bg-card border-border/60"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Registrar Entrada Simulado
                </Button>
              </form>
            </Card>
          )}

          {/* Swimsuit Regulations Widget */}
          <Card className="p-5 border-border/40 space-y-4 text-xs leading-normal">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <h3 className="text-sm font-bold text-foreground">Regulação de Trajes World Aquatics</h3>
            </div>
            <p className="text-muted-foreground">
              De acordo com a regra de trajes da World Aquatics:
            </p>
            <ul className="space-y-2 list-disc pl-4 text-slate-300">
              <li>
                <strong>Selo FINA:</strong> Todo traje deve conter o selo de homologação FINA válido (código de barras QR visível).
              </li>
              <li>
                <strong>Medidas:</strong> O traje para homens não deve ir acima do umbigo nem abaixo do joelho. Para mulheres, não deve cobrir o pescoço, passar do ombro ou do joelho.
              </li>
              <li>
                <strong>Logotipos:</strong> Permitido apenas um logotipo do fabricante (máx. 30cm²) e um logotipo do clube (máx. 50cm²).
              </li>
            </ul>

            {role !== "Público" && swimmers.map((s) => s.status === "Presente" && s.traje === "Verificando" && (
              <div key={s.qrCodeId} className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-warning">
                  <AlertTriangle className="h-4 w-4" /> Inspeção Necessária: {s.atleta}
                </div>
                <p className="text-[11px] text-muted-foreground">O atleta declarou uso de novo traje modelo 2026. Confirme a presença da marca de certificação.</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90 text-white"
                    onClick={() => handleVerifyTraje(s.qrCodeId, "Homologado")}
                  >
                    Aprovar Traje
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => handleVerifyTraje(s.qrCodeId, "Não Apresentado")}
                  >
                    Reprovar
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

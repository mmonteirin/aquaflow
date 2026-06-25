import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Tv,
  Play,
  Settings2,
  Tv2,
  Award,
  Video,
  ExternalLink,
  Laptop,
  CheckCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/transmissao")({
  head: () => ({
    meta: [
      { title: "Central de Transmissão & Overlays — AquaFlow" },
      { name: "description", content: "Gerador de caracteres de TV (Lower Thirds) e placares de transmissão OBS para natação." },
    ],
  }),
  component: TransmissaoManager,
});

const mockSwimmers = [
  { raia: 1, atleta: "Rodrigo Melo", clube: "Pinheiros", tempo: "54.12" },
  { raia: 2, atleta: "Bruno Castro", clube: "SESI-SP", tempo: "52.88" },
  { raia: 3, atleta: "Lucas Ferreira", clube: "Flamengo", tempo: "51.10" },
  { raia: 4, atleta: "João Silva", clube: "Minas TC", tempo: "48.21" },
  { raia: 5, atleta: "Pedro Alencar", clube: "SESI-SP", tempo: "49.34" },
  { raia: 6, atleta: "Matheus Lima", clube: "Praia Clube", tempo: "52.12" },
  { raia: 7, atleta: "Felipe Souza", clube: "GNU", tempo: "53.40" },
  { raia: 8, atleta: "Gustavo Lima", clube: "Pinheiros", tempo: "53.99" },
];

function TransmissaoManager() {
  const [activeOverlay, setActiveOverlay] = useState<"none" | "startlist" | "results" | "record" | "focused">("none");
  const [focusedAthlete, setFocusedAthlete] = useState("João Silva");
  const [chromaKey, setChromaKey] = useState(false);

  const handleCopyObsUrl = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/transmissao?overlay=true`;
      navigator.clipboard.writeText(url);
      toast.success("Link do Overlay copiado para integração no OBS Studio (Navegador)!");
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Central de Transmissão & Overlays"
        description="Geração de sobreposições de TV (Lower Thirds) e placares de transmissão ao vivo integrados com OBS Studio."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left Side: Live TV Output Mockup */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-border/40 bg-black">
            {/* Viewport header */}
            <div className="bg-slate-900 border-b border-border/40 px-4 py-2.5 flex items-center justify-between text-xs text-white">
              <span className="flex items-center gap-1.5 font-bold">
                <Eye className="h-4 w-4 text-primary" /> Visualização do Feed da Transmissão (Jumbo/Overlay)
              </span>
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" /> LIVE OVERLAY ACTIVE
              </span>
            </div>

            {/* Video mockup frame */}
            <div
              className={`relative aspect-video w-full flex flex-col justify-end transition-all ${
                chromaKey ? "bg-green-600" : "bg-slate-950"
              }`}
              style={{
                backgroundImage: chromaKey
                  ? "none"
                  : 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=1200&auto=format&fit=crop&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay graphics layer */}

              {/* focused swimmer lower third */}
              {activeOverlay === "focused" && (
                <div className="absolute left-6 bottom-6 flex items-center gap-3.5 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent border-l-4 border-primary px-5 py-3 rounded text-white animate-slide-in w-[320px]">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-sky-400">RAIA 4 · LÍDER DE BALIZAMENTO</p>
                    <h4 className="text-base font-extrabold tracking-tight mt-0.5">{focusedAthlete}</h4>
                    <p className="text-xs text-slate-300">Minas Tênis Clube · Tempo: 48.21s</p>
                  </div>
                </div>
              )}

              {/* Startlist lower third */}
              {activeOverlay === "startlist" && (
                <div className="absolute inset-x-6 bottom-6 bg-slate-950/95 border-t border-primary/40 rounded p-4 text-white animate-slide-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Start List — 100m Livre M. (Final)</span>
                    <Badge variant="outline" className="border-sky-300 text-sky-300 text-[9px] py-0 h-4">Série 4</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] leading-tight">
                    {mockSwimmers.slice(0, 8).map((s) => (
                      <div key={s.raia} className="flex items-center gap-1.5 border border-white/5 bg-white/5 p-1 rounded">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-bold">{s.raia}</span>
                        <div className="truncate">
                          <p className="font-bold truncate">{s.atleta.split(" ")[0]}</p>
                          <p className="text-[8px] text-slate-400 truncate">{s.clube}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Results overlay */}
              {activeOverlay === "results" && (
                <div className="absolute right-6 top-6 bottom-6 w-72 bg-slate-950/95 border border-white/10 rounded p-4 text-white animate-slide-in flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-3">
                      <Tv2 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-sky-300 uppercase">Placar Eletrônico Oficial</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      {mockSwimmers.slice(0, 5).map((s, idx) => (
                        <div key={s.raia} className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">{idx + 1}</span>
                            <span className="font-semibold">{s.atleta}</span>
                          </div>
                          <span className="font-mono font-bold text-sky-400">{s.tempo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10 text-[9px] text-slate-400 flex items-center justify-between">
                    <span>Cronometragem Omega</span>
                    <span className="text-green-400 font-bold uppercase">Resultados Homologados</span>
                  </div>
                </div>
              )}

              {/* Record Banner */}
              {activeOverlay === "record" && (
                <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 bg-red-600 text-white rounded border-2 border-yellow-500 shadow-xl p-5 text-center flex flex-col items-center gap-2.5 animate-bounce">
                  <Award className="h-10 w-10 text-yellow-300 animate-pulse fill-yellow-300/20" />
                  <div className="leading-tight">
                    <p className="text-xs font-extrabold tracking-widest text-yellow-300">NOVO RECORDE BRASILEIRO ESTABELECIDO</p>
                    <h3 className="text-xl font-extrabold mt-1">João Silva (Minas Tênis Clube)</h3>
                    <p className="text-base font-bold font-mono tracking-tight mt-1">Tempo Oficial: 48.21s (100m Livre)</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Overlay Operator Controls */}
        <div className="space-y-4">
          <Card className="p-5 border-border/40 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <Sliders className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Controle do Operador de TV</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <Label className="text-muted-foreground">Selecionar Gráfico Ativo (Overlays)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={activeOverlay === "none" ? "default" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setActiveOverlay("none")}
                  >
                    Desativar
                  </Button>
                  <Button
                    type="button"
                    variant={activeOverlay === "startlist" ? "default" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setActiveOverlay("startlist")}
                  >
                    Start List GC
                  </Button>
                  <Button
                    type="button"
                    variant={activeOverlay === "results" ? "default" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setActiveOverlay("results")}
                  >
                    Resultados TV
                  </Button>
                  <Button
                    type="button"
                    variant={activeOverlay === "record" ? "default" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setActiveOverlay("record")}
                  >
                    Alerta Recorde
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/20 pt-3">
                <Label className="text-muted-foreground">Focar no Atleta (Lower Third)</Label>
                <select
                  value={focusedAthlete}
                  onChange={(e) => {
                    setFocusedAthlete(e.target.value);
                    setActiveOverlay("focused");
                  }}
                  className="w-full mt-1.5 rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8 focus:outline-none"
                >
                  <option value="João Silva">João Silva (Minas TC)</option>
                  <option value="Pedro Alencar">Pedro Alencar (SESI-SP)</option>
                  <option value="Lucas Ferreira">Lucas Ferreira (Flamengo)</option>
                </select>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  variant={activeOverlay === "focused" ? "default" : "outline"}
                  onClick={() => setActiveOverlay("focused")}
                >
                  Projetar Perfil Atleta
                </Button>
              </div>

              <div className="border-t border-border/20 pt-3.5 flex items-center justify-between">
                <div>
                  <Label htmlFor="chroma" className="font-semibold text-foreground">Fundo Cromaqui (Chroma-Key)</Label>
                  <p className="text-[10px] text-muted-foreground">Ativa fundo verde para corte transparente no OBS</p>
                </div>
                <input
                  id="chroma"
                  type="checkbox"
                  checked={chromaKey}
                  onChange={(e) => setChromaKey(e.target.checked)}
                  className="rounded border-border accent-primary h-4.5 w-4.5 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="h-4.5 w-4.5 text-muted-foreground" />
              <h4 className="text-xs font-bold text-foreground">Integração Externa OBS Studio</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-normal mb-3.5">
              Utilize o AquaFlow como fonte de navegador (Browser Source) transparente no seu software de transmissão (OBS, vMix, Wirecast).
            </p>
            <Button variant="outline" size="sm" onClick={handleCopyObsUrl} className="w-full">
              <ExternalLink className="mr-1.5 h-4 w-4" /> Copiar URL do Overlay
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

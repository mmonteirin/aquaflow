import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  ListTodo,
  Settings,
  Database,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/lib/rbac";
import { auditLogs } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Segurança & Perfis RBAC — AquaFlow" },
      { name: "description", content: "Configurações do sistema, perfis de acesso, matriz de privilégios e logs de auditoria." },
    ],
  }),
  component: ConfiguracoesManager,
});

interface PermissionMatrixRow {
  modulo: string;
  superAdmin: boolean;
  conf: boolean;
  fed: boolean;
  clube: boolean;
  arbitro: boolean;
  publico: boolean;
}

const permissionMatrix: PermissionMatrixRow[] = [
  { modulo: "Criar Competições", superAdmin: true, conf: true, fed: true, clube: false, arbitro: false, publico: false },
  { modulo: "Cadastrar Atletas", superAdmin: true, conf: true, fed: true, clube: true, arbitro: false, publico: false },
  { modulo: "Lançar Resultados", superAdmin: true, conf: false, fed: true, clube: false, arbitro: true, publico: false },
  { modulo: "Homologar Recordes", superAdmin: true, conf: true, fed: false, clube: false, arbitro: false, publico: false },
  { modulo: "Julgar Protestos", superAdmin: true, conf: false, fed: false, clube: false, arbitro: true, publico: false },
  { modulo: "Ver Financeiro", superAdmin: true, conf: true, fed: true, clube: true, arbitro: false, publico: false },
  { modulo: "Ver Rankings Públicos", superAdmin: true, conf: true, fed: true, clube: true, arbitro: true, publico: true },
];

function ConfiguracoesManager() {
  const { role } = useRBAC();
  const [logs, setLogs] = useState(auditLogs);

  const handleExportLogs = () => {
    toast.success("Logs de auditoria exportados para planilha Excel!");
  };

  const getCheckIcon = (allowed: boolean) => {
    return allowed ? (
      <CheckCircle className="h-4.5 w-4.5 text-success mx-auto" />
    ) : (
      <XCircle className="h-4.5 w-4.5 text-slate-700 mx-auto" />
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Configurações & Perfis de Segurança"
        description="Painel de controle de políticas de acesso (RBAC), auditoria geral e chaves de integração."
      />

      <div className="space-y-4">
        {/* Warnings */}
        <Card className="flex items-center gap-3 border-info/30 bg-info/10 p-4 text-xs">
          <ShieldCheck className="h-5 w-5 text-info shrink-0" />
          <p className="text-foreground leading-normal">
            Você está operando no modo de simulação. As alterações de perfil na barra superior modificam as permissões vigentes em tempo real. Todos os acessos são gravados nas tabelas de auditoria de conformidade.
          </p>
        </Card>

        <Tabs defaultValue="matrix">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="matrix" className="text-xs">Matriz de Acesso</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Logs de Auditoria</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">Chaves do Sistema</TabsTrigger>
          </TabsList>

          {/* Access Matrix Tab */}
          <TabsContent value="matrix" className="space-y-4 pt-3.5">
            <Card className="p-5 border-border/40 overflow-x-auto">
              <div className="mb-4 border-b border-border/20 pb-3">
                <h3 className="text-sm font-bold text-foreground">Matriz de Privilégios de Segurança (RBAC)</h3>
                <p className="text-[10px] text-muted-foreground">Definição formal de direitos de escrita/leitura do ecossistema aquático</p>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[10px] bg-muted/20">
                    <th className="px-4 py-3">Módulo / Função</th>
                    <th className="px-2 py-3 text-center">Super Admin</th>
                    <th className="px-2 py-3 text-center">Confederação</th>
                    <th className="px-2 py-3 text-center">Federação</th>
                    <th className="px-2 py-3 text-center">Clube</th>
                    <th className="px-2 py-3 text-center">Árbitro</th>
                    <th className="px-2 py-3 text-center">Público</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionMatrix.map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10 font-medium">
                      <td className="px-4 py-3 font-semibold text-foreground">{row.modulo}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.superAdmin)}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.conf)}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.fed)}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.clube)}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.arbitro)}</td>
                      <td className="px-2 py-3 text-center">{getCheckIcon(row.publico)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-4 pt-3.5">
            <Card className="p-5 border-border/40 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Histórico de Auditoria de Segurança</h3>
                  <p className="text-[10px] text-muted-foreground">Registro de todas as ações de gravação e exclusão no banco de dados</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportLogs}>
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Exportar Planilha
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] text-muted-foreground uppercase bg-muted/20">
                      <th className="px-4 py-3">Código</th>
                      <th className="px-3 py-3">Data / Hora</th>
                      <th className="px-3 py-3">Usuário</th>
                      <th className="px-3 py-3">Perfil</th>
                      <th className="px-3 py-3">Ação Executada</th>
                      <th className="px-4 py-3 text-right">IP Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/10 font-medium">
                        <td className="px-4 py-3.5 font-bold text-sky-400">{log.id}</td>
                        <td className="px-3 py-3.5 text-muted-foreground">{log.data}</td>
                        <td className="px-3 py-3.5 text-foreground">{log.usuario}</td>
                        <td className="px-3 py-3.5">
                          <Badge variant="outline" className="border-primary/20 text-sky-400 text-[10px]">{log.perfil}</Badge>
                        </td>
                        <td className="px-3 py-3.5 text-foreground font-semibold">{log.acao}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-[10px] text-muted-foreground">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-4 pt-3.5">
            <Card className="p-5 border-border/40 space-y-4 text-xs">
              <div className="border-b border-border/20 pb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Tokens de Integração do SGE</h3>
              </div>

              <div className="space-y-3.5 max-w-lg">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold">API Gateway de Pagamento (PIX/Cartão)</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="password"
                      value="••••••••••••••••••••••••••••••••"
                      disabled
                      className="flex-1 rounded border border-border bg-slate-900 px-3 py-1.5 font-mono text-xs"
                    />
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold">Colorado Timing COM Port Token</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="password"
                      value="••••••••••••••••••••••••••••••••"
                      disabled
                      className="flex-1 rounded border border-border bg-slate-900 px-3 py-1.5 font-mono text-xs"
                    />
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 text-destructive text-[11px] p-3 rounded flex gap-2">
                  <Lock className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Chaves de Produção Criptografadas</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Para sua segurança, todos os segredos são armazenados em cofres de criptografia fortes (Vault) e nunca transitam em texto puro nos logs do sistema.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

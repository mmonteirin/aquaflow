import { cn } from "@/lib/utils";

export const STATUS_COLORS: Record<string, string> = {
  // Success states
  Homologada: "bg-success/15 text-success",
  Aprovado: "bg-success/15 text-success",
  Presente: "bg-success/15 text-success",
  Deferido: "bg-success/15 text-success",
  Ativo: "bg-success/15 text-success",

  // Info states
  "Em andamento": "bg-info/15 text-info",
  "Inscrições abertas": "bg-info/15 text-info",
  Aberto: "bg-info/15 text-info",

  // Warning states
  "Em análise": "bg-warning/15 text-warning",
  Aguardando: "bg-warning/15 text-warning",
  Pendente: "bg-warning/15 text-warning",
  Planejamento: "bg-warning/15 text-warning",

  // Neutral states
  "Inscrições encerradas": "bg-muted text-muted-foreground",
  Encerrada: "bg-muted text-muted-foreground",
  Inativo: "bg-muted text-muted-foreground",

  // Destructive states
  DQ: "bg-destructive/15 text-destructive",
  Ausente: "bg-destructive/15 text-destructive",
  Indeferido: "bg-destructive/15 text-destructive",
};

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

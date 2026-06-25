import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  deltaType = "success",
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "success" | "warning" | "destructive" | "info";
  icon: LucideIcon;
  onClick?: () => void;
}) {
  const deltaColorMap = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
  };

  return (
    <Card
      className={cn("p-5", onClick && "cursor-pointer transition-colors hover:bg-accent/50")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {delta && <p className={cn("mt-1 text-xs font-medium", deltaColorMap[deltaType])}>{delta}</p>}
    </Card>
  );
}

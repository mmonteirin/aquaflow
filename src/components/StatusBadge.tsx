import { cn } from "@/lib/utils";
import { STATUS_COLORS, getStatusColor } from "@/components/status-colors";

export function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant?: "success" | "info" | "warning" | "muted" | "destructive";
}) {
  const colorClass = variant
    ? {
        success: "bg-success/15 text-success",
        info: "bg-info/15 text-info",
        warning: "bg-warning/15 text-warning",
        muted: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/15 text-destructive",
      }[variant]
    : getStatusColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
      )}
    >
      {status}
    </span>
  );
}

import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Waves, ChevronDown, BadgeCheck } from "lucide-react";
import { navGroups, type NavGroup } from "@/lib/nav";
import { cn } from "@/lib/utils";

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  plan?: string;
  status?: "active" | "inactive";
}

const DEFAULT_USER: UserProfile = {
  name: "Administrador",
  email: "admin@aquaflow.app",
  initials: "AD",
  plan: "Plano Completo",
  status: "active",
};

function GroupSection({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const containsActive = group.items.some((i) => isActive(i.to));
  const [open, setOpen] = useState(containsActive);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  // Ungrouped (no label) — render items flat.
  if (!group.label) {
    return (
      <div role="group" className="space-y-1">
        {group.items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.to)
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            role="menuitem"
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div role="group">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => handleKeyDown(e, () => setOpen((o) => !o))}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
          containsActive
            ? "text-white"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
        aria-expanded={open}
        aria-controls={`group-${group.label}`}
      >
        {group.icon && <group.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />}
        <span className="flex-1 text-left">{group.label}</span>
        {group.badge && (
          <span
            className="rounded-full bg-sidebar-primary px-2 py-0.5 text-[10px] font-bold text-sidebar-primary-foreground"
            aria-label={`${group.badge} novos itens`}
          >
            {group.badge}
          </span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : "")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={`group-${group.label}`} className="mt-1 space-y-0.5 pl-3" role="menu">
          {group.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l border-sidebar-border px-3 py-2 text-[13px] font-medium transition-colors",
                isActive(item.to)
                  ? "border-sidebar-primary bg-sidebar-primary/15 text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              role="menuitem"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  onNavigate,
  user = DEFAULT_USER,
}: {
  onNavigate?: () => void;
  user?: UserProfile;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground"
      aria-label="Menu principal"
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
          <Waves className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">AquaFlow</p>
          <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground">
            Gestão Esportiva · v1.0
          </p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-2 overflow-y-auto px-3 py-4"
        role="menubar"
        aria-label="Navegação principal"
      >
        {navGroups.map((group, i) => (
          <GroupSection
            key={group.label ?? i}
            group={group}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground"
              aria-label={`Usuário: ${user.name}`}
            >
              {user.initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-sidebar-foreground">{user.email}</p>
            </div>
          </div>
          {user.plan && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-info">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" /> {user.plan}
              </span>
              {user.status === "active" && (
                <span
                  className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-semibold text-success"
                  role="status"
                >
                  Ativo
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

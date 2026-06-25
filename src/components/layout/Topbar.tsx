import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Home,
  Shield,
  Globe,
  Zap,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRBAC, type Role } from "@/lib/rbac";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

function DateTimeDisplay() {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        ", " +
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      setCurrentDateTime(formatted);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
      <span className="font-medium">{currentDateTime}</span>
    </div>
  );
}

function LanguageSelector() {
  const [language, setLanguage] = useState("pt");

  return (
    <div className="hidden items-center gap-1.5 rounded-lg border border-border/40 bg-card px-2 py-1 text-xs md:flex">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <label htmlFor="language-select" className="sr-only">
        Selecionar idioma
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border-0 bg-transparent py-0.5 pl-1 pr-4 text-xs font-medium text-foreground focus:outline-none focus:ring-0"
      >
        <option value="pt">Português</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}

function RoleSelector() {
  const { role, setRole } = useRBAC();

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-xs">
      <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span className="hidden font-medium text-muted-foreground md:inline">Simulador:</span>
      <label htmlFor="role-select" className="sr-only">
        Selecionar perfil de usuário
      </label>
      <select
        id="role-select"
        value={role}
        onChange={(e) => {
          const newRole = e.target.value as Role;
          setRole(newRole);
          toast.success(`Simulando perfil: ${newRole}`);
        }}
        className="border-0 bg-transparent py-0.5 pl-1 pr-6 text-xs font-bold text-foreground focus:outline-none focus:ring-0"
      >
        <option value="Super Admin">Super Admin</option>
        <option value="Confederação">Confederação</option>
        <option value="Federação">Federação</option>
        <option value="Clube">Clube</option>
        <option value="Árbitro">Árbitro</option>
        <option value="Técnico">Técnico</option>
        <option value="Atleta">Atleta</option>
        <option value="Público">Público</option>
      </select>
    </div>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function NotificationButton() {
  return (
    <Button variant="ghost" size="icon" aria-label="Notificações">
      <Bell className="h-5 w-5" />
      <span
        className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"
        aria-hidden="true"
      />
    </Button>
  );
}

export function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <nav className="hidden items-center gap-1.5 text-sm md:flex" aria-label="Breadcrumb">
        <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-semibold text-foreground">AquaFlow</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-muted-foreground">Menu Principal</span>
      </nav>

      <div className="relative ml-auto hidden max-w-xs flex-1 lg:block">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input placeholder="Buscar..." className="pl-9" aria-label="Buscar" />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <DateTimeDisplay />
        <LanguageSelector />
        <RoleSelector />

        <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex">
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          SUPORTE
        </Button>
        <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Quick
        </Button>
        <ThemeToggle />
        <NotificationButton />

        <Button variant="ghost" size="sm" className="hidden gap-1.5 text-muted-foreground sm:flex">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </Button>
      </div>
    </header>
  );
}

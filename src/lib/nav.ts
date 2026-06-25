import {
  LayoutDashboard,
  Trophy,
  Waves,
  ClipboardList,
  User,
  Users,
  Gavel,
  Timer,
  ListOrdered,
  Award,
  BarChart3,
  ShieldAlert,
  FileText,
  Settings,
  CalendarClock,
  UserCheck,
  SlidersHorizontal,
  DollarSign,
  Tv,
  TrendingUp,
  Smartphone,
  Monitor,
  CreditCard,
  UserCog,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  /** When set, the group is a collapsible section with a header label + icon. */
  label?: string;
  icon?: LucideIcon;
  badge?: string;
  /** Route used to detect whether the group contains the active route. */
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    label: "Natação",
    icon: Waves,
    items: [
      { label: "Competições", to: "/competicoes", icon: Trophy },
      { label: "Resultados", to: "/resultados", icon: BarChart3 },
      { label: "Modalidades", to: "/modalidades", icon: Grid3x3 },
      { label: "Clubes", to: "/clubes", icon: Users },
    ],
  },
  {
    label: "Recursos",
    icon: SlidersHorizontal,
    items: [
      { label: "App Web", to: "/app-web", icon: Monitor, badge: "2" },
      { label: "App Windows", to: "/app-windows", icon: Monitor },
      { label: "App Mac OS", to: "/app-macos", icon: Monitor },
      { label: "Ajustes", to: "/ajustes", icon: Settings },
    ],
  },
  {
    label: "Arbitragem",
    icon: Gavel,
    items: [
      { label: "Escalamento & Nível", to: "/arbitragem", icon: Gavel },
      { label: "Protestos", to: "/protestos", icon: ShieldAlert },
    ],
  },
  {
    label: "Técnicos & Staff",
    icon: UserCheck,
    items: [
      { label: "Atletas", to: "/atletas", icon: User },
      { label: "Clubes", to: "/clubes", icon: Users },
    ],
  },
  {
    label: "Gestão Financeira",
    icon: DollarSign,
    items: [{ label: "Financeiro", to: "/financeiro", icon: DollarSign }],
  },
  {
    label: "Assinatura",
    icon: CreditCard,
    items: [{ label: "Plano & Faturamento", to: "/assinatura", icon: CreditCard }],
  },
  {
    label: "Usuários",
    icon: UserCog,
    items: [{ label: "Gestão de Usuários", to: "/usuarios", icon: UserCog }],
  },
];

// Flat list kept for any consumer that needs it (e.g. search).
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

// Helper constants since the original nav had door open and medal imported.
import { Medal as MedalIcon, DoorOpen as DoorOpenIcon } from "lucide-react";
export { MedalIcon, DoorOpenIcon };

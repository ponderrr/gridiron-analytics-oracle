import {
  Home,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Settings,
  Shield,
  Calculator,
  BarChart3,
  Target,
  Wrench,
  Layout,
} from "lucide-react";

export interface SidebarItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  comingSoon?: boolean;
}

export interface SidebarSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
}

export const SIDEBAR_SECTIONS_CONFIG: SidebarSection[] = [
  {
    title: "Main",
    icon: Layout,
    items: [
      {
        href: "/dashboard",
        icon: Home,
        label: "Dashboard",
      },
    ],
  },
  {
    title: "Analysis",
    icon: BarChart3,
    items: [
      {
        href: "/players",
        icon: Users,
        label: "Players",
      },
      {
        href: "/analytics",
        icon: TrendingUp,
        label: "Analytics",
      },
      {
        href: "/trade-analyzer",
        icon: ArrowLeftRight,
        label: "Trade Analyzer",
      },
    ],
  },
  {
    title: "Management",
    icon: Target,
    items: [
      {
        href: "/admin",
        icon: Shield,
        label: "Admin Panel",
      },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    items: [
      {
        href: "/fantasy-points-test",
        icon: Calculator,
        label: "Points Calculator",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
      },
    ],
  },
];

import {
  Home,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Settings,
  Shield,
  BarChart3,
  Target,
  Wrench,
  Layout,
  Link,
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
        label: "Rankings",
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
      {
        href: "/admin/mapping",
        icon: Link,
        label: "Player Mapping",
      },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    items: [
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
      },
    ],
  },
];

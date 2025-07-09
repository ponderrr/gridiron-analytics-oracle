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
import { MESSAGE_CONSTANTS } from "@/lib/constants";

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
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.MAIN,
    icon: Layout,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.DASHBOARD,
        icon: Home,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.DASHBOARD,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.ANALYSIS,
    icon: BarChart3,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.PLAYERS,
        icon: Users,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.PLAYERS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ANALYTICS,
        icon: TrendingUp,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ANALYTICS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.TRADE_ANALYZER,
        icon: ArrowLeftRight,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.TRADE_ANALYZER,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.MANAGEMENT,
    icon: Target,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ADMIN,
        icon: Shield,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ADMIN_PANEL,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.TOOLS,
    icon: Wrench,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.FANTASY_POINTS_TEST,
        icon: Calculator,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.POINTS_CALCULATOR,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.SETTINGS,
        icon: Settings,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.SETTINGS,
      },
    ],
  },
];

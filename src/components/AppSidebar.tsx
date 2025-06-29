import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  comingSoon?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon: Icon,
  label,
  comingSoon,
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-700",
        isActive
          ? "bg-emerald-500 text-white hover:bg-emerald-400"
          : "text-slate-400"
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
      {comingSoon && (
        <span className="ml-auto text-xs text-slate-500 uppercase">Soon</span>
      )}
    </Link>
  );
};

const AppSidebarComponent = function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } flex flex-col h-screen`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="bg-emerald-500 p-2 rounded-md">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-white">FF Guru</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-slate-700"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem href="/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/players" icon={Users} label="Players" />
        <NavItem href="/analytics" icon={TrendingUp} label="Analytics" />
        <NavItem
          href="/trade-analyzer"
          icon={ArrowLeftRight}
          label="Trade Analyzer"
        />
        <NavItem href="/league" icon={Trophy} label="League" comingSoon />
        <NavItem href="/admin" icon={Shield} label="Admin" />
        <NavItem
          href="/fantasy-points-test"
          icon={Calculator}
          label="Points Test"
        />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </nav>

      {/* Footer Section */}
      <div className="px-4 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </div>
  );
};

export default AppSidebarComponent;

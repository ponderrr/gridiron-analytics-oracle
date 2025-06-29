
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  TrendingUp, 
  ArrowLeftRight, 
  Trophy, 
  Settings,
  Database
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const AppSidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Trade Analyzer', href: '/trade-analyzer', icon: ArrowLeftRight },
    { name: 'League', href: '/league', icon: Trophy, comingSoon: true },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Admin', href: '/admin', icon: Database },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.href)
                ? 'bg-emerald-900 text-emerald-100'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon
              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                isActive(item.href) ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            />
            {!isCollapsed && (
              <span className="flex-1">{item.name}</span>
            )}
            {!isCollapsed && item.comingSoon && (
              <span className="ml-auto text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default AppSidebar;


import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  TrendingUp, 
  ArrowLeftRight, 
  Trophy, 
  Settings 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Players',
    url: '/players',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Trade Analyzer',
    url: '/trade-analyzer',
    icon: ArrowLeftRight,
  },
  {
    title: 'League',
    url: '/league',
    icon: Trophy,
    comingSoon: true,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-slate-700/50">
      <SidebarContent className="bg-slate-800/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider font-semibold px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild={!item.comingSoon}
                      isActive={isActive}
                      className={`
                        ${isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }
                        ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      {item.comingSoon ? (
                        <div className="flex items-center space-x-3 w-full">
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1">{item.title}</span>
                          <span className="text-xs bg-slate-600 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link to={item.url} className="flex items-center space-x-3 w-full">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

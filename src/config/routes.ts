import { lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load heavy components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Players = lazy(() => import("@/pages/Players"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Admin = lazy(() => import("@/pages/Admin"));
const FantasyPointsTest = lazy(() => import("@/pages/FantasyPointsTest"));

// Regular imports for lighter components
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import TradeAnalyzer from "@/pages/TradeAnalyzer";
import League from "@/pages/League";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  lazy?: boolean;
  errorBoundary?: boolean;
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: "/",
    component: Index,
    protected: false,
  },
  {
    path: "/login",
    component: Login,
    protected: false,
  },
  {
    path: "/signup",
    component: Signup,
    protected: false,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    protected: false,
  },

  // Protected routes - Lazy loaded
  {
    path: "/dashboard",
    component: Dashboard,
    protected: true,
    lazy: true,
  },
  {
    path: "/players",
    component: Players,
    protected: true,
    lazy: true,
  },
  {
    path: "/analytics",
    component: Analytics,
    protected: true,
    lazy: true,
  },
  {
    path: "/admin",
    component: Admin,
    protected: true,
    lazy: true,
    errorBoundary: true,
  },
  {
    path: "/fantasy-points-test",
    component: FantasyPointsTest,
    protected: true,
    lazy: true,
    errorBoundary: true,
  },

  // Protected routes - Regular imports
  {
    path: "/trade-analyzer",
    component: TradeAnalyzer,
    protected: true,
  },
  {
    path: "/league",
    component: League,
    protected: true,
  },
  {
    path: "/settings",
    component: Settings,
    protected: true,
  },

  // 404 page
  {
    path: "*",
    component: NotFound,
    protected: false,
  },
];

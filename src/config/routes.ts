import { lazy } from "react";

// Lazy load all heavy components for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Players = lazy(() => import("@/pages/Players"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Admin = lazy(() => import("@/pages/Admin"));
const FantasyPointsTest = lazy(() => import("@/pages/FantasyPointsTest"));
const TradeAnalyzer = lazy(() => import("@/pages/TradeAnalyzer"));
const League = lazy(() => import("@/pages/League"));
const Settings = lazy(() => import("@/pages/Settings"));

// Regular imports for lighter components
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
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

  // Protected routes - All lazy loaded for consistency
  {
    path: "/dashboard",
    component: Dashboard,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/players",
    component: Players,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/analytics",
    component: Analytics,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/admin",
    component: Admin,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/fantasy-points-test",
    component: FantasyPointsTest,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/trade-analyzer",
    component: TradeAnalyzer,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/league",
    component: League,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/settings",
    component: Settings,
    protected: true,
    errorBoundary: true,
  },

  // 404 page
  {
    path: "*",
    component: NotFound,
    protected: false,
  },
];

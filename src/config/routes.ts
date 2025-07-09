import { lazy } from "react";

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Players = lazy(() => import("@/pages/Players"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Admin = lazy(() => import("@/pages/Admin"));
const FantasyPointsTest = lazy(() => import("@/pages/FantasyPointsTest"));
const TradeAnalyzer = lazy(() => import("@/pages/TradeAnalyzer"));

const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));

// Regular imports for lighter components
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
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
    path: "/auth",
    component: Auth,
    protected: false,
  },
  {
    path: "/login",
    component: Auth,
    protected: false,
  },
  {
    path: "/signup",
    component: Auth,
    protected: false,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    protected: false,
  },

  // Protected routes - Lazy loaded for bundle-size optimization
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
    path: "/settings",
    component: Settings,
    protected: true,
    errorBoundary: true,
  },
  {
    path: "/profile",
    component: Profile,
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

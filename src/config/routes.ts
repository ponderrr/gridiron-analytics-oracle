import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Wrap all lazy components in Suspense with fallback
const withSuspense = (Component: React.LazyExoticComponent<any>) => (props: any) => (
  <Suspense fallback={<LoadingSpinner size="lg" label="Loading..." />}>
    <Component {...props} />
  </Suspense>
);

const Dashboard = withSuspense(lazy(() => import("@/pages/Dashboard")));
const Players = withSuspense(lazy(() => import("@/pages/Players")));
const Analytics = withSuspense(lazy(() => import("@/pages/Analytics")));
const Admin = withSuspense(lazy(() => import("@/pages/Admin")));
const AdminMapping = withSuspense(lazy(() => import("@/pages/AdminMapping")));
const TradeAnalyzer = withSuspense(lazy(() => import("@/pages/TradeAnalyzer")));
const Settings = withSuspense(lazy(() => import("@/pages/Settings")));
const Profile = withSuspense(lazy(() => import("@/pages/Profile")));

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
    path: "/admin/mapping",
    component: AdminMapping,
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

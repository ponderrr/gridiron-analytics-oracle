import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown,
  Star,
  Calendar,
  BarChart3,
  Zap,
  Eye,
  Clock,
  Award,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Flame,
  Shield,
  Heart,
  Brain,
  Target as TargetIcon,
  BarChart,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Filter,
  Search,
  BookOpen,
  Share2,
  Download,
  Copy,
  Bell,
  User,
  Cog,
  HelpCircle,
  Calculator,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player } from "@/lib/database";
import { cn } from "@/lib/utils";

// Enhanced mock data with more realistic fantasy football information
const mockTopPlayers: Player[] = [
  {
    id: "1",
    player_id: "1",
    name: "Christian McCaffrey",
    position: "RB",
    team: "SF",
    active: true,
    bye_week: 9,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "2",
    player_id: "2",
    name: "Tyreek Hill",
    position: "WR",
    team: "MIA",
    active: true,
    bye_week: 11,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "3",
    player_id: "3",
    name: "Austin Ekeler",
    position: "RB",
    team: "WAS",
    active: true,
    bye_week: 14,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "4",
    player_id: "4",
    name: "CeeDee Lamb",
    position: "WR",
    team: "DAL",
    active: true,
    bye_week: 7,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "5",
    player_id: "5",
    name: "Breece Hall",
    position: "RB",
    team: "NYJ",
    active: true,
    bye_week: 12,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "6",
    player_id: "6",
    name: "Amon-Ra St. Brown",
    position: "WR",
    team: "DET",
    active: true,
    bye_week: 9,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "7",
    player_id: "7",
    name: "Saquon Barkley",
    position: "RB",
    team: "PHI",
    active: true,
    bye_week: 10,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "8",
    player_id: "8",
    name: "Garrett Wilson",
    position: "WR",
    team: "NYJ",
    active: true,
    bye_week: 12,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "9",
    player_id: "9",
    name: "Rachaad White",
    position: "RB",
    team: "TB",
    active: true,
    bye_week: 5,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "10",
    player_id: "10",
    name: "Drake London",
    position: "WR",
    team: "ATL",
    active: true,
    bye_week: 11,
    created_at: "",
    updated_at: "",
    metadata: null
  }
];

// Position color mapping for outline (matching Rankings page)
const positionOutline = {
  QB: "border-blue-500 text-blue-500",
  RB: "border-red-500 text-red-500",
  WR: "border-green-500 text-green-500",
  TE: "border-purple-500 text-purple-500",
  K: "border-gray-400 text-gray-400",
  DEF: "border-gray-400 text-gray-400"
};

// Position glow color mapping (matching Rankings page)
const getPositionGlowColor = (position: string) => {
  switch (position) {
    case "QB": return "0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 12px -2px rgba(59, 130, 246, 0.3)"; // blue
    case "RB": return "0 10px 25px -3px rgba(239, 68, 68, 0.4), 0 4px 12px -2px rgba(239, 68, 68, 0.3)"; // red
    case "WR": return "0 10px 25px -3px rgba(34, 197, 94, 0.4), 0 4px 12px -2px rgba(34, 197, 94, 0.3)"; // green
    case "TE": return "0 10px 25px -3px rgba(168, 85, 247, 0.4), 0 4px 12px -2px rgba(168, 85, 247, 0.3)"; // purple
    case "K": return "0 10px 25px -3px rgba(156, 163, 175, 0.4), 0 4px 12px -2px rgba(156, 163, 175, 0.3)"; // gray
    case "DEF": return "0 10px 25px -3px rgba(156, 163, 175, 0.4), 0 4px 12px -2px rgba(156, 163, 175, 0.3)"; // gray
    default: return "0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 12px -2px rgba(59, 130, 246, 0.3)"; // default blue
  }
};

const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">DASHBOARD</h1>
        <p className="text-lg text-muted-foreground text-center mb-10">Your fantasy football command center</p>

        {/* Top 10 Players Section */}
        <div className="w-full flex flex-col gap-3 mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">TOP 10 PLAYERS</h2>
          {mockTopPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-semibold text-lg truncate">{player.name}</span>
                  <span className="ml-2 text-base text-muted-foreground font-medium truncate">{player.team}</span>
                </div>
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold text-base border-2 bg-background",
                  positionOutline[player.position as keyof typeof positionOutline] || "border-gray-300 text-gray-500",
                  "rounded-full ml-auto"
                )}>
                  {player.position}
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <DashboardContent />
    </Layout>
  );
};

export default Dashboard;

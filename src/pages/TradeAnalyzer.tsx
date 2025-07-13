import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Plus,
  X,
  TrendingUp,
  ArrowRight,
  Crown,
  Target,
  Search,
  Filter,
  Settings,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Equal,
  Zap,
  Users,
  BarChart3,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingDown,
  Eye,
  Share2,
  Download,
  Copy
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RankingsProvider, useRankings } from "@/components/PlayerRankings";
import { useTradeAnalysis } from "@/hooks/useTradeAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

// Mock data for live reactions
const mockLiveReactions = [
  { id: 1, type: "thumbs_up", count: 24, percentage: 60 },
  { id: 2, type: "thumbs_down", count: 8, percentage: 20 },
  { id: 3, type: "neutral", count: 8, percentage: 20 }
];

const getPositionColor = (position: string) => {
  switch (position) {
    case "QB": return "bg-blue-500";
    case "RB": return "bg-green-500";
    case "WR": return "bg-purple-500";
    case "TE": return "bg-orange-500";
    case "K": return "bg-yellow-500";
    case "DEF": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getTradeValueColor = (value: number) => {
  if (value >= 80) return "text-green-500";
  if (value >= 60) return "text-blue-500";
  if (value >= 40) return "text-yellow-500";
  return "text-red-500";
};

const getFairnessColor = (fairness: string) => {
  switch (fairness.toLowerCase()) {
    case "very fair": return "text-green-500";
    case "fair": return "text-blue-500";
    case "unfair": return "text-yellow-500";
    case "very unfair": return "text-red-500";
    default: return "text-gray-500";
  }
};

const getFairnessIcon = (fairness: string) => {
  switch (fairness.toLowerCase()) {
    case "very fair": return CheckCircle;
    case "fair": return ThumbsUp;
    case "unfair": return ThumbsDown;
    case "very unfair": return AlertTriangle;
    default: return Minus;
  }
};

function TradeAnalyzerContent() {
  const { state, selectSet } = useRankings();
  const { effectiveTheme } = useTheme();
  const {
    yourPlayers,
    targetPlayers,
    tradeAnalysis,
    addPlayerToTrade,
    removePlayerFromTrade,
    clearTrade,
    availablePlayers,
    currentSet,
  } = useTradeAnalysis();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [showLiveReactions, setShowLiveReactions] = useState(true);
  const [selectedRankingType, setSelectedRankingType] = useState<"dynasty" | "redraft">("dynasty");

  // Filter available players based on search and position
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  // Add player to trade
  const handleAddPlayer = (player: any, side: "your" | "target") => {
    addPlayerToTrade(player, side);
    toast.success(
      `${player.name} added to ${side === "your" ? "your" : "target"} side.`
    );
  };

  const handleRemovePlayer = (playerId: string, side: "your" | "target") => {
    removePlayerFromTrade(playerId, side);
    toast.success(
      `Player removed from ${side === "your" ? "your" : "target"} side.`
    );
  };

  const handleClearTrade = () => {
    clearTrade();
    toast.info("Trade cleared.");
  };

  // Calculate trade summary
  const yourSideValue = yourPlayers.reduce((sum, p) => sum + p.tradeValue, 0);
  const targetSideValue = targetPlayers.reduce((sum, p) => sum + p.tradeValue, 0);
  const valueDifference = targetSideValue - yourSideValue;
  const valueRatio = yourSideValue > 0 ? targetSideValue / yourSideValue : 0;

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-full max-w-2xl bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <ArrowLeftRight className="h-10 w-10 text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Trade Analyzer</h1>
          <p className="text-lg text-[var(--color-text-tertiary)] mb-6">Analyze trades using your personal rankings and get community insights</p>
          {/* You can add a coming soon or empty state here if needed */}
        </div>
      </div>
    </Layout>
  );
}

const TradeAnalyzer: React.FC = () => {
  return (
    <RankingsProvider>
      <TradeAnalyzerContent />
    </RankingsProvider>
  );
};

export default TradeAnalyzer;

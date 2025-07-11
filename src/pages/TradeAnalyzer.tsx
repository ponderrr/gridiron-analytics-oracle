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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center space-x-3">
                <ArrowLeftRight className="h-8 w-8 text-primary" />
                <span>Trade Analyzer</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Analyze trades using your personal rankings and get community insights
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Trade
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Ranking Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Ranking Type
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Button
                    variant={selectedRankingType === "dynasty" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRankingType("dynasty")}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Dynasty
                  </Button>
                  <Button
                    variant={selectedRankingType === "redraft" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRankingType("redraft")}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Redraft
                  </Button>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="min-w-[250px]">
                <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Select Rankings
                </Label>
                <Select
                  value={currentSet?.id || ""}
                  onValueChange={(value) => selectSet(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose your rankings" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.sets
                      .filter(set => set.format === selectedRankingType)
                      .map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentSet && (
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="outline" className="text-xs">
                  {currentSet.format}
                </Badge>
                <span className="text-[var(--color-text-secondary)]">
                  {state.rankedItems.length} ranked players
                </span>
                <span className="text-[var(--color-text-secondary)]">•</span>
                <span className="text-[var(--color-text-secondary)]">
                  Last updated: {new Date(currentSet.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                Search Players
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Search by player name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-[var(--color-text-primary)]">
                Position
              </Label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="mt-1 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="QB">QB</SelectItem>
                  <SelectItem value="RB">RB</SelectItem>
                  <SelectItem value="WR">WR</SelectItem>
                  <SelectItem value="TE">TE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showLiveReactions}
                  onCheckedChange={setShowLiveReactions}
                />
                <Label className="text-sm text-[var(--color-text-primary)]">
                  Live Reactions
                </Label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trade Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Your Team */}
          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Your Players</span>
                </div>
                {yourPlayers.length > 0 && (
                  <Badge className="bg-green-500 text-white">
                    {yourSideValue.toFixed(0)} pts
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {yourPlayers.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--color-border-primary)] rounded-lg p-8 text-center">
                  <Plus className="h-8 w-8 text-[var(--color-text-secondary)] mx-auto mb-2" />
                  <p className="text-[var(--color-text-secondary)]">
                    Select players to trade away
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {yourPlayers.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-[var(--color-bg-secondary)] rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-primary/40">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {player.name}
                            </span>
                            <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                              {player.position}
                            </Badge>
                            {player.rank && (
                              <Badge variant="outline" className="text-xs">
                                #{player.rank}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {player.team} • Value: <span className={getTradeValueColor(player.tradeValue)}>{player.tradeValue.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id, "your")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Available Players */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Available Players
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPlayers.slice(0, 10).map((player) => {
                    const rankedPlayer = state.rankedItems.find(
                      (rp: any) => rp.player_id === player.id
                    );
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player, "your")}
                        className="w-full flex items-center justify-between bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-card)] rounded p-2 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {player.name}
                          </span>
                          <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                            {player.position}
                          </Badge>
                          {rankedPlayer && (
                            <Badge variant="outline" className="text-xs">
                              #{rankedPlayer.overall_rank}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {player.team}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Target */}
          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                  <span>Players to Receive</span>
                </div>
                {targetPlayers.length > 0 && (
                  <Badge className="bg-blue-500 text-white">
                    {targetSideValue.toFixed(0)} pts
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetPlayers.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--color-border-primary)] rounded-lg p-8 text-center">
                  <Plus className="h-8 w-8 text-[var(--color-text-secondary)] mx-auto mb-2" />
                  <p className="text-[var(--color-text-secondary)]">
                    Select players to acquire
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {targetPlayers.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-[var(--color-bg-secondary)] rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-primary/40">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {player.name}
                            </span>
                            <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                              {player.position}
                            </Badge>
                            {player.rank && (
                              <Badge variant="outline" className="text-xs">
                                #{player.rank}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {player.team} • Value: <span className={getTradeValueColor(player.tradeValue)}>{player.tradeValue.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id, "target")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Available Players */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Available Players
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPlayers.slice(0, 10).map((player) => {
                    const rankedPlayer = state.rankedItems.find(
                      (rp: any) => rp.player_id === player.id
                    );
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player, "target")}
                        className="w-full flex items-center justify-between bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-card)] rounded p-2 text-left transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {player.name}
                          </span>
                          <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                            {player.position}
                          </Badge>
                          {rankedPlayer && (
                            <Badge variant="outline" className="text-xs">
                              #{rankedPlayer.overall_rank}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {player.team}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trade Analysis Results */}
        {(yourPlayers.length > 0 || targetPlayers.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Trade Analysis */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span>Trade Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fairness Rating */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {(() => {
                      const Icon = getFairnessIcon(tradeAnalysis?.fairness || "neutral");
                      return <Icon className={`h-8 w-8 ${getFairnessColor(tradeAnalysis?.fairness || "neutral")}`} />;
                    })()}
                    <h3 className={`text-2xl font-bold ${getFairnessColor(tradeAnalysis?.fairness || "neutral")}`}>
                      {tradeAnalysis?.fairness || "Neutral"}
                    </h3>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {tradeAnalysis?.recommendation || "Add players to analyze trade"}
                  </p>
                </div>

                {/* Value Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--color-text-secondary)]">Your Side</span>
                      <span className="font-bold text-green-500">{yourSideValue.toFixed(0)}</span>
                    </div>
                    <Progress value={(yourSideValue / Math.max(yourSideValue, targetSideValue)) * 100} className="h-2" />
                  </div>
                  <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--color-text-secondary)]">Their Side</span>
                      <span className="font-bold text-blue-500">{targetSideValue.toFixed(0)}</span>
                    </div>
                    <Progress value={(targetSideValue / Math.max(yourSideValue, targetSideValue)) * 100} className="h-2" />
                  </div>
                </div>

                {/* Value Difference */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Value Difference</span>
                    <div className="flex items-center space-x-2">
                      {valueDifference > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : valueDifference < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Equal className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={`font-bold ${valueDifference > 0 ? 'text-green-500' : valueDifference < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {Math.abs(valueDifference).toFixed(0)} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={handleClearTrade}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Trade
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Reactions */}
            {showLiveReactions && (
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Live Reactions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {mockLiveReactions.map((reaction) => (
                      <div key={reaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {reaction.type === "thumbs_up" && <ThumbsUp className="h-4 w-4 text-green-500" />}
                          {reaction.type === "thumbs_down" && <ThumbsDown className="h-4 w-4 text-red-500" />}
                          {reaction.type === "neutral" && <Minus className="h-4 w-4 text-gray-500" />}
                          <span className="text-sm text-[var(--color-text-primary)] capitalize">
                            {reaction.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {reaction.count}
                          </span>
                          <div className="w-16 bg-[var(--color-bg-secondary)] rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${reaction.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Based on 40 community votes
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Vote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
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

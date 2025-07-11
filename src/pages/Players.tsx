import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trophy,
  Calendar,
  Grid,
  List
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Player } from "@/lib/database";
import { cn } from "@/lib/utils";

// Types for the ranking system
export interface RankingSet {
  id: string;
  name: string;
  format: "dynasty" | "redraft";
  rankingType: "top200" | "position";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface RankedPlayer {
  id: string;
  playerId: string;
  overallRank: number;
  positionRank?: number;
  tier?: number;
  notes?: string;
  player: Player;
}

interface PlayersState {
  currentSet: RankingSet | null;
  sets: RankingSet[];
  availablePlayers: Player[];
  rankedPlayers: RankedPlayer[];
  loading: boolean;
  searchTerm: string;
  activeTab: string;
  viewMode: "grid" | "list";
  sortBy: "rank" | "name" | "position" | "team";
  sortOrder: "asc" | "desc";
}

// Mock data for development
const mockPlayers: Player[] = [
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
    name: "Josh Allen",
    position: "QB",
    team: "BUF",
    active: true,
    bye_week: 13,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "7",
    player_id: "7",
    name: "Travis Kelce",
    position: "TE",
    team: "KC",
    active: true,
    bye_week: 10,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "8",
    player_id: "8",
    name: "Ja'Marr Chase",
    position: "WR",
    team: "CIN",
    active: true,
    bye_week: 7,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "9",
    player_id: "9",
    name: "Patrick Mahomes",
    position: "QB",
    team: "KC",
    active: true,
    bye_week: 10,
    created_at: "",
    updated_at: "",
    metadata: null
  },
  {
    id: "10",
    player_id: "10",
    name: "Saquon Barkley",
    position: "RB",
    team: "PHI",
    active: true,
    bye_week: 7,
    created_at: "",
    updated_at: "",
    metadata: null
  }
];

const mockSets: RankingSet[] = [
  {
    id: "1",
    name: "Dynasty Top 200",
    format: "dynasty",
    rankingType: "top200",
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    description: "Comprehensive dynasty rankings including players and picks"
  }
];

const positions: string[] = ["overall", "QB", "RB", "WR", "TE", "K", "DEF"];

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: "dynasty" | "redraft") => void;
}

const CreateSetModal: React.FC<CreateSetModalProps> = ({ isOpen, onClose, onSelectFormat }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md bg-background border-0 shadow-xl rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">Create New Ranking Set</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <p className="text-center text-muted-foreground">Choose your league format:</p>
        <div className="flex flex-col space-y-3">
          <Button onClick={() => onSelectFormat("dynasty")} className="h-14 text-lg font-semibold w-full rounded-xl">Dynasty</Button>
          <Button onClick={() => onSelectFormat("redraft")} className="h-14 text-lg font-semibold w-full rounded-xl">Redraft</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Position color mapping for outline
const positionOutline = {
  QB: "border-blue-500 text-blue-500",
  RB: "border-red-500 text-red-500",
  WR: "border-green-500 text-green-500",
  TE: "border-purple-500 text-purple-500",
  K: "border-gray-400 text-gray-400",
  DEF: "border-gray-400 text-gray-400"
};

// Position glow color mapping
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

const PlayersContent: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PlayersState>({
    currentSet: mockSets[0],
    sets: mockSets,
    availablePlayers: mockPlayers,
    rankedPlayers: mockPlayers.slice(0, 200).map((player, index) => ({
      id: player.id,
      playerId: player.id,
      overallRank: index + 1,
      positionRank: Math.floor(Math.random() * 20) + 1,
      tier: Math.floor(Math.random() * 5) + 1,
      player
    })),
    loading: false,
    searchTerm: "",
    activeTab: "overall",
    viewMode: "list",
    sortBy: "rank",
    sortOrder: "asc"
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Autofocus search bar on mount
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const handleCreateSet = (format: "dynasty" | "redraft") => {
    const newSet: RankingSet = {
      id: Date.now().toString(),
      name: `${format.charAt(0).toUpperCase() + format.slice(1)} Top 200`,
      format,
      rankingType: "top200",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: `Top 200 ${format} rankings`
    };
    setState(prev => ({ ...prev, sets: [...prev.sets, newSet], currentSet: newSet }));
    setShowCreateModal(false);
    toast.success(`Created new ${format} ranking set!`);
  };

  // Only filter by player name and active tab (position)
  const filteredPlayers = state.rankedPlayers.filter(player => {
    const matchesName = player.player.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesPosition =
      state.activeTab === "overall" || player.player.position === state.activeTab;
    return matchesName && matchesPosition;
  });
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let comparison = 0;
    switch (state.sortBy) {
      case "rank": comparison = a.overallRank - b.overallRank; break;
      case "name": comparison = a.player.name.localeCompare(b.player.name); break;
      case "position": comparison = a.player.position.localeCompare(b.player.position); break;
      case "team": comparison = a.player.team.localeCompare(b.player.team); break;
    }
    return state.sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">RANKINGS</h1>
        <p className="text-lg text-muted-foreground text-center mb-10">Top 200 players ranked by dynasty and redraft value</p>

        {/* Search and controls */}
        <div className="w-full flex flex-col items-center gap-4 mb-8">
          <Input
            ref={searchInputRef}
            autoFocus
            placeholder="Search players by name..."
            value={state.searchTerm}
            onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full h-14 text-lg px-6 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          />
          <div className="flex gap-2 w-full justify-center">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-6 h-12 text-base font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />Create New
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {positions.map((position: string) => (
            <button
              key={position}
              onClick={() => setState(prev => ({ ...prev, activeTab: position }))}
              className={cn(
                "px-5 py-2 rounded-full font-medium text-base border border-border transition-all duration-200 relative",
                state.activeTab === position
                  ? "bg-primary text-white border-primary shadow-lg"
                  : "bg-muted text-foreground hover:bg-primary/10"
              )}
              style={state.activeTab === position ? {
                boxShadow: getPositionGlowColor(position)
              } : undefined}
            >
              {position === "overall" ? "Overall" : position}
              {state.activeTab === position && (
                <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-pulse pointer-events-none"></span>
              )}
            </button>
          ))}
        </div>

        {/* Players */}
        <div className="flex flex-col gap-3 w-full">
          {sortedPlayers.slice(0, 200).map((rankedPlayer, index) => (
            <motion.div
              key={rankedPlayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
            >
              <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-border bg-card shadow-sm transition-all duration-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                  #{rankedPlayer.overallRank}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-semibold text-lg truncate">{rankedPlayer.player.name}</span>
                  <span className="ml-2 text-base text-muted-foreground font-medium truncate">{rankedPlayer.player.team}</span>
                </div>
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold text-base border-2 bg-background",
                  positionOutline[rankedPlayer.player.position as keyof typeof positionOutline] || "border-gray-300 text-gray-500",
                  "rounded-full ml-auto"
                )}>
                  {rankedPlayer.player.position}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {sortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No players found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create Set Modal */}
      <CreateSetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSelectFormat={handleCreateSet}
      />
    </div>
  );
};

const Players: React.FC = () => (
  <Layout>
    <PlayersContent />
  </Layout>
);

export default Players;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Mail, 
  Crown, 
  Trophy, 
  Star, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Target,
  Edit,
  Plus,
  Filter,
  Search,
  Eye,
  EyeOff,
  Download,
  Share2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Activity,
  List
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { RankingsProvider, useRankings } from "@/components/PlayerRankings";
import { Player } from "@/lib/database";

// Mock user profile data - replace with real data from auth context
const mockUserProfile = {
  username: "FantasyGuru2024",
  email: "user@example.com",
  memberSince: "2023-01-15",
  totalRankings: 12,
  activeRankings: 3,
  accuracyRate: 89,
  favoriteTeam: "DAL",
  bio: "Fantasy football enthusiast with a passion for data-driven decisions and dynasty leagues."
};

// Mock ranking sets data
const mockRankingSets = [
  {
    id: "1",
    name: "Dynasty Rankings 2024",
    format: "dynasty" as const,
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    playerCount: 150
  },
  {
    id: "2", 
    name: "Redraft Rankings Week 5",
    format: "redraft" as const,
    is_active: true,
    created_at: "2024-01-18T09:15:00Z",
    updated_at: "2024-01-22T16:20:00Z",
    playerCount: 200
  },
  {
    id: "3",
    name: "Dynasty Rankings 2023",
    format: "dynasty" as const,
    is_active: false,
    created_at: "2023-08-10T11:00:00Z",
    updated_at: "2023-12-30T13:30:00Z",
    playerCount: 120
  }
];

// Mock top ranked players for display
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
  }
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

const getRankBadgeColor = (rank: number) => {
  if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
  if (rank <= 5) return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
  if (rank <= 10) return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
  return "bg-gray-200 text-gray-800";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ProfileContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPrivateRankings, setShowPrivateRankings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");

  // Get username from auth context or use mock data
  const username = user?.email?.split('@')[0] || mockUserProfile.username;

  const filteredRankingSets = mockRankingSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === "all" || set.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Background Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 rounded-lg mb-6"></div>
          
          {/* Profile Info */}
          <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16 sm:-mt-20">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
                <AvatarImage src="" alt={username} />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
                    {username}
                  </h1>
                  <p className="text-[var(--color-text-secondary)] mt-1">
                    Member since {formatDate(mockUserProfile.memberSince)}
                  </p>
                  {mockUserProfile.bio && (
                    <p className="text-[var(--color-text-secondary)] mt-2 max-w-2xl">
                      {mockUserProfile.bio}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Total Rankings</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">{mockUserProfile.totalRankings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Active Rankings</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">{mockUserProfile.activeRankings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Accuracy Rate</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">{mockUserProfile.accuracyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Favorite Team</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">{mockUserProfile.favoriteTeam}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animated Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-xl shadow-lg p-6"
        >
          {/* Tab Navigation */}
          <div className="relative flex mb-8 border-b border-slate-200 dark:border-slate-200/10">
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "overview" 
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400" 
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("overview")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Overview</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "rankings" 
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400" 
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("rankings")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <List className="h-5 w-5" />
                <span>My Rankings</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "activity" 
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400" 
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("activity")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity</span>
              </div>
            </button>
            
            {/* Animated Indicator */}
            <motion.span
              className="absolute bottom-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded"
              initial={false}
              animate={{
                left: activeTab === "overview" ? "0%" : 
                      activeTab === "rankings" ? "33.33%" : "66.66%",
                width: "33.33%"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Players Preview */}
                  <div className="lg:col-span-2">
                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          <span>Top 5 Players</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockTopPlayers.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <Badge className={`${getRankBadgeColor(index + 1)} font-bold text-sm px-2 py-1`}>
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/40">
                                  {player.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                                {player.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm">
                                <Badge className={`${getPositionColor(player.position)} text-white text-xs`}>
                                  {player.position}
                                </Badge>
                                <span className="text-[var(--color-text-secondary)]">•</span>
                                <span className="text-[var(--color-text-secondary)]">{player.team}</span>
                                {player.bye_week && (
                                  <>
                                    <span className="text-[var(--color-text-secondary)]">•</span>
                                    <span className="text-[var(--color-text-tertiary)]">Bye: Week {player.bye_week}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                              {index === 1 && <Star className="w-5 h-5 text-gray-400" />}
                              {index === 2 && <Trophy className="w-5 h-5 text-amber-600" />}
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-6">
                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-[var(--color-text-primary)]">
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">Ranking Accuracy</span>
                            <span className="text-[var(--color-text-primary)] font-medium">{mockUserProfile.accuracyRate}%</span>
                          </div>
                          <Progress value={mockUserProfile.accuracyRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">Completion Rate</span>
                            <span className="text-[var(--color-text-primary)] font-medium">95%</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">Consistency Score</span>
                            <span className="text-[var(--color-text-primary)] font-medium">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-[var(--color-text-primary)]">
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-[var(--color-text-secondary)]">Updated Dynasty Rankings</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-[var(--color-text-secondary)]">Created Week 5 Rankings</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-[var(--color-text-secondary)]">Shared rankings with league</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Rankings Tab */}
              {activeTab === "rankings" && (
                <div className="space-y-6">
                  {/* Rankings Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">My Rankings</h2>
                      <p className="text-[var(--color-text-secondary)] mt-1">
                        Manage and view your fantasy football rankings
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Ranking
                      </Button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search rankings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <Select value={formatFilter} onValueChange={setFormatFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Formats</SelectItem>
                        <SelectItem value="dynasty">Dynasty</SelectItem>
                        <SelectItem value="redraft">Redraft</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  {/* Rankings List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRankingSets.map((set, index) => (
                      <motion.div
                        key={set.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] truncate">
                                  {set.name}
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={set.format === "dynasty" ? "default" : "secondary"} className="text-xs">
                                    {set.format}
                                  </Badge>
                                  {set.is_active && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-secondary)]">Players Ranked</span>
                                <span className="text-[var(--color-text-primary)] font-medium">{set.playerCount}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-secondary)]">Last Updated</span>
                                <span className="text-[var(--color-text-primary)]">{formatDate(set.updated_at)}</span>
                              </div>
                              <Separator />
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="space-y-6">
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Activity items would go here */}
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                            No Recent Activity
                          </h3>
                          <p className="text-[var(--color-text-secondary)]">
                            Your activity will appear here as you interact with rankings and the platform.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

const Profile: React.FC = () => {
  return (
    <RankingsProvider>
      <ProfileContent />
    </RankingsProvider>
  );
};

export default Profile;

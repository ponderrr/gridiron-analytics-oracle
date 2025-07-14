import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewPlayer {
  id: string;
  player_id: string;
  player_name: string;
  position?: string;
  team?: string;
  suggested_matches: Array<{
    sleeper_id: string;
    full_name: string;
    score: number;
    confidence: string;
  }>;
}

interface PlayerReviewTableProps {
  players: ReviewPlayer[];
  selectedPlayers: Set<string>;
  onPlayerSelect: (playerId: string, selected: boolean) => void;
  onPlayerClick: (player: ReviewPlayer) => void;
  isLoading: boolean;
  error: any;
}

export function PlayerReviewTable({
  players,
  selectedPlayers,
  onPlayerSelect,
  onPlayerClick,
  isLoading,
  error
}: PlayerReviewTableProps) {
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load review queue: {error.message}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No players in review queue
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={players.length > 0 && selectedPlayers.size === players.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    players.forEach(player => onPlayerSelect(player.id, true));
                  } else {
                    players.forEach(player => onPlayerSelect(player.id, false));
                  }
                }}
              />
            </TableHead>
            <TableHead>Player Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Best Match</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const bestMatch = player.suggested_matches[0];
            const isSelected = selectedPlayers.has(player.id);
            
            return (
              <TableRow 
                key={player.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-muted/50'
                }`}
                onClick={() => onPlayerClick(player)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onPlayerSelect(player.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{player.player_name}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {player.player_id}
                  </div>
                </TableCell>
                <TableCell>
                  {player.position && (
                    <Badge variant="outline">{player.position}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {player.team && (
                    <Badge variant="secondary">{player.team}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {bestMatch ? (
                    <div>
                      <div className="font-medium">{bestMatch.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {bestMatch.sleeper_id}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No matches</span>
                  )}
                </TableCell>
                <TableCell>
                  {bestMatch && (
                    <div className="flex items-center space-x-2">
                      {getConfidenceIcon(bestMatch.confidence)}
                      {getConfidenceBadge(bestMatch.confidence)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {bestMatch && (
                    <span className="font-mono text-sm">
                      {(bestMatch.score * 100).toFixed(1)}%
                    </span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayerClick(player)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 
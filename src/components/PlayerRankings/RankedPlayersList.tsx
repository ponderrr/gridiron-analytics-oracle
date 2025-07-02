import React, { useCallback } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Grid3X3 } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { useRankings } from './RankingsProvider';

export function RankedPlayersList() {
  const { state, dispatch } = useRankings();
  const [viewMode, setViewMode] = React.useState<'linear' | 'tiers'>('linear');

  const handleRemoveFromRankings = useCallback((playerId: string) => {
    dispatch({ type: 'PUSH_UNDO', payload: [...state.rankedPlayers] });
    dispatch({ type: 'REMOVE_RANKED_PLAYER', payload: playerId });
  }, [dispatch, state.rankedPlayers]);

  const groupedByTiers = React.useMemo(() => {
    const tiers = new Map<number, typeof state.rankedPlayers>();
    
    state.rankedPlayers.forEach(player => {
      const tier = player.tier || 0;
      if (!tiers.has(tier)) {
        tiers.set(tier, []);
      }
      tiers.get(tier)!.push(player);
    });

    return Array.from(tiers.entries())
      .sort(([a], [b]) => a - b)
      .map(([tier, players]) => ({
        tier,
        players: players.sort((a, b) => a.overall_rank - b.overall_rank)
      }));
  }, [state.rankedPlayers]);

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1: return 'Elite';
      case 2: return 'High-End';
      case 3: return 'Mid-Tier 1';
      case 4: return 'Mid-Tier 2';
      case 5: return 'Depth';
      case 6: return 'Late Round';
      case 7: return 'Waiver Wire';
      default: return 'Untiered';
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 2: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 3: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 4: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 5: return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 6: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 7: return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Rankings</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'linear' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('linear')}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tiers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tiers')}
              className="p-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Badge variant="outline" className="text-slate-300">
            {state.rankedPlayers.length} ranked
          </Badge>
        </div>
      </div>

      {state.rankedPlayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="text-lg mb-2">No players ranked yet</p>
            <p className="text-sm">Drag players from the left or use "Create Default Rankings"</p>
          </div>
        </div>
      ) : viewMode === 'linear' ? (
        <Droppable droppableId="ranked-players">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto space-y-2 ${
                snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg' : ''
              }`}
            >
              {state.rankedPlayers.map((rankedPlayer, index) => (
                <Draggable
                  key={rankedPlayer.player_id}
                  draggableId={`ranked-${rankedPlayer.player_id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <PlayerCard
                        player={rankedPlayer.player}
                        rank={rankedPlayer.overall_rank}
                        tier={rankedPlayer.tier}
                        isRanked={true}
                        isDragging={snapshot.isDragging}
                        onRemoveFromRankings={handleRemoveFromRankings}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {groupedByTiers.map(({ tier, players }) => (
            <div key={tier} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTierColor(tier)}>
                  Tier {tier}: {getTierName(tier)}
                </Badge>
                <span className="text-sm text-slate-400">({players.length} players)</span>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                {players.map((rankedPlayer) => (
                  <PlayerCard
                    key={rankedPlayer.player_id}
                    player={rankedPlayer.player}
                    rank={rankedPlayer.overall_rank}
                    tier={rankedPlayer.tier}
                    isRanked={true}
                    onRemoveFromRankings={handleRemoveFromRankings}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
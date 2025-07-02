import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useRankings } from './RankingsProvider';

export function PlayerSearch() {
  const { state, dispatch } = useRankings();

  const positions = ['all', 'QB', 'RB', 'WR', 'TE', 'K', 'D/ST'];
  const teams = [
    'all', 'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
    'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN',
    'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
  ];

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white">Search & Filters</h3>
      
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search players..."
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Position</Label>
            <Select
              value={state.positionFilter}
              onValueChange={(value) => dispatch({ type: 'SET_POSITION_FILTER', payload: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>
                    {pos === 'all' ? 'All Positions' : pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Team</Label>
            <Select
              value={state.teamFilter}
              onValueChange={(value) => dispatch({ type: 'SET_TEAM_FILTER', payload: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team === 'all' ? 'All Teams' : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showOnlyUnranked"
            checked={state.showOnlyUnranked}
            onCheckedChange={(checked) => 
              dispatch({ type: 'SET_SHOW_ONLY_UNRANKED', payload: !!checked })
            }
          />
          <Label htmlFor="showOnlyUnranked" className="text-sm text-slate-300">
            Show only unranked players
          </Label>
        </div>
      </div>
    </div>
  );
}
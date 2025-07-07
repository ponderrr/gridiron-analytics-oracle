import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { usePlayerFilters } from "@/hooks/usePlayerFilters";
import { positions, teams } from "@/constants/playerData";

// test
export function PlayerSearch() {
  const {
    filters: { searchTerm, positionFilter, teamFilter, showOnlyUnranked },
    setSearchTerm,
    setPositionFilter,
    setTeamFilter,
    setShowOnlyUnranked,
    rawSearchTerm,
  } = usePlayerFilters();

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white">Search & Filters</h3>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search players..."
            value={rawSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Position</Label>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos === "all" ? "All Positions" : pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Team</Label>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team === "all" ? "All Teams" : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showOnlyUnranked"
            checked={showOnlyUnranked}
            onCheckedChange={(checked) => setShowOnlyUnranked(!!checked)}
          />
          <Label htmlFor="showOnlyUnranked" className="text-sm text-slate-300">
            Show only unranked players
          </Label>
        </div>
      </div>
    </div>
  );
}

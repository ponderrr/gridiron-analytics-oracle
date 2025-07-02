import { useState } from "react";
import useDebounce from "./useDebounce";

export interface PlayerFilters {
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  showOnlyUnranked: boolean;
}

export function usePlayerFilters(initial?: Partial<PlayerFilters>) {
  const [searchTerm, setSearchTerm] = useState(initial?.searchTerm || "");
  const [positionFilter, setPositionFilter] = useState(
    initial?.positionFilter || "all"
  );
  const [teamFilter, setTeamFilter] = useState(initial?.teamFilter || "all");
  const [showOnlyUnranked, setShowOnlyUnranked] = useState(
    initial?.showOnlyUnranked || false
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  return {
    filters: {
      searchTerm: debouncedSearchTerm,
      positionFilter,
      teamFilter,
      showOnlyUnranked,
    },
    setSearchTerm,
    setPositionFilter,
    setTeamFilter,
    setShowOnlyUnranked,
    rawSearchTerm: searchTerm,
  };
}

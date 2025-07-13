import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface UnmappedPlayer {
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

export default function MappingReview() {
  const [unmappedPlayers, setUnmappedPlayers] = useState<UnmappedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingCreateId, setProcessingCreateId] = useState<string | null>(
    null
  );
  const [processingRejectId, setProcessingRejectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadUnmappedPlayers();
  }, []);

  const loadUnmappedPlayers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "manual-mapping-review",
        {
          body: { action: "list" },
        }
      );

      if (error) {
        console.error("Failed to load unmapped players:", error);
        toast.error("Failed to load unmapped players. Please try again.");
        return;
      }

      if (data?.success) {
        setUnmappedPlayers(data.data);
      } else {
        toast.error("Failed to load unmapped players. Please try again.");
      }
    } catch (error) {
      console.error("Failed to load unmapped players:", error);
      toast.error("Failed to load unmapped players. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createMapping = async (
    nflverseId: string,
    sleeperId: string,
    canonicalName: string
  ) => {
    setProcessingCreateId(nflverseId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "manual-mapping-review",
        {
          body: {
            action: "create",
            nflverse_id: nflverseId,
            sleeper_id: sleeperId,
            canonical_name: canonicalName,
            notes: "Manual mapping from admin review",
          },
        }
      );

      if (error) {
        console.error("Failed to create mapping:", error);
        toast.error("Failed to create player mapping. Please try again.");
        return;
      }

      if (data?.success) {
        // Remove from list
        setUnmappedPlayers((prev) =>
          prev.filter((p) => p.player_id !== nflverseId)
        );
        toast.success("Player mapping created successfully!");
      } else {
        toast.error("Failed to create player mapping. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create mapping:", error);
      toast.error("Failed to create player mapping. Please try again.");
    } finally {
      setProcessingCreateId(null);
    }
  };

  const rejectMapping = async (nflverseId: string) => {
    setProcessingRejectId(nflverseId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "manual-mapping-review",
        {
          body: {
            action: "reject",
            nflverse_id: nflverseId,
            reason: "No valid match found",
          },
        }
      );

      if (error) {
        console.error("Failed to reject mapping:", error);
        toast.error("Failed to reject player mapping. Please try again.");
        return;
      }

      if (data?.success) {
        // Remove from list
        setUnmappedPlayers((prev) =>
          prev.filter((p) => p.player_id !== nflverseId)
        );
        toast.success("Player mapping rejected successfully!");
      } else {
        toast.error("Failed to reject player mapping. Please try again.");
      }
    } catch (error) {
      console.error("Failed to reject mapping:", error);
      toast.error("Failed to reject player mapping. Please try again.");
    } finally {
      setProcessingRejectId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading unmapped players...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manual Player Mapping Review</h1>
        <div className="flex gap-2">
          <Button onClick={loadUnmappedPlayers} variant="outline">
            Refresh
          </Button>
          <Badge variant="secondary">
            {unmappedPlayers.length} players need review
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {unmappedPlayers.map((player) => (
          <Card key={player.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span className="text-lg">{player.player_name}</span>
                  {player.position && (
                    <Badge variant="outline" className="ml-2">
                      {player.position}
                    </Badge>
                  )}
                  {player.team && (
                    <Badge variant="outline" className="ml-2">
                      {player.team}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => rejectMapping(player.player_id)}
                  variant="danger"
                  size="sm"
                  disabled={processingRejectId === player.player_id}
                >
                  Reject
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  NFLVerse ID: {player.player_id}
                </p>

                {player.suggested_matches.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Suggested Matches:</h4>
                    <div className="space-y-2">
                      {player.suggested_matches.map((match) => (
                        <div
                          key={match.sleeper_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium">{match.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Sleeper ID: {match.sleeper_id}
                              </p>
                            </div>
                            <Badge
                              variant={
                                match.confidence === "high"
                                  ? "default"
                                  : match.confidence === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {Math.round(match.score * 100)}% match
                            </Badge>
                          </div>
                          <Button
                            onClick={() =>
                              createMapping(
                                player.player_id,
                                match.sleeper_id,
                                player.player_name
                              )
                            }
                            disabled={processingCreateId === player.player_id}
                            size="sm"
                          >
                            {processingCreateId === player.player_id
                              ? "Processing..."
                              : "Accept"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No suggested matches found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {unmappedPlayers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              🎉 All players have been reviewed! No unmapped players found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

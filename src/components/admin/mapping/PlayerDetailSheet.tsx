import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  X,
  AlertTriangle,
  User,
  Hash,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface PlayerDetailSheetProps {
  player: ReviewPlayer | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (sleeperId: string, canonicalName: string) => void;
  onReject: (reason: string) => void;
}

export function PlayerDetailSheet({
  player,
  isOpen,
  onClose,
  onAccept,
  onReject,
}: PlayerDetailSheetProps) {
  const [customMapping, setCustomMapping] = useState({
    sleeperId: "",
    canonicalName: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const handleAcceptMatch = (sleeperId: string, canonicalName: string) => {
    onAccept(sleeperId, canonicalName);
    onClose();
  };

  const handleReject = () => {
    onReject(rejectReason || "Manual rejection - not fantasy relevant");
    onClose();
  };

  const handleCustomAccept = () => {
    if (customMapping.sleeperId && customMapping.canonicalName) {
      onAccept(customMapping.sleeperId, customMapping.canonicalName);
      onClose();
    }
  };

  if (!player) return null;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Review Player Mapping</span>
          </SheetTitle>
          <SheetDescription>
            Review and approve the suggested mapping for this player
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Player Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">NFLverse Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{player.player_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{player.player_id}</span>
              </div>
              <div className="flex items-center space-x-4">
                {player.position && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{player.position}</Badge>
                  </div>
                )}
                {player.team && (
                  <Badge variant="secondary">{player.team}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Matches */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggested Matches</h3>

            {player.suggested_matches.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No suggested matches found</p>
                    <p className="text-sm">
                      You may need to create a custom mapping
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {player.suggested_matches.map((match) => (
                  <Card
                    key={match.sleeper_id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      match.confidence === "high" ? "ring-2 ring-green-200" : ""
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {match.full_name}
                            </span>
                            <Badge
                              className={getConfidenceColor(match.confidence)}
                            >
                              {match.confidence}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sleeper ID: {match.sleeper_id}
                          </div>
                          <div className="text-sm font-mono">
                            Match Score: {(match.score * 100).toFixed(1)}%
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            handleAcceptMatch(match.sleeper_id, match.full_name)
                          }
                          variant={
                            match.confidence === "high" ? "default" : "outline"
                          }
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Custom Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sleeper-id">Sleeper Player ID</Label>
                <Input
                  id="sleeper-id"
                  placeholder="Enter Sleeper player ID"
                  value={customMapping.sleeperId}
                  onChange={(e) =>
                    setCustomMapping((prev) => ({
                      ...prev,
                      sleeperId: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical-name">Canonical Name</Label>
                <Input
                  id="canonical-name"
                  placeholder="Enter canonical player name"
                  value={customMapping.canonicalName}
                  onChange={(e) =>
                    setCustomMapping((prev) => ({
                      ...prev,
                      canonicalName: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                onClick={handleCustomAccept}
                disabled={
                  !customMapping.sleeperId || !customMapping.canonicalName
                }
                className="w-full"
              >
                Create Custom Mapping
              </Button>
            </CardContent>
          </Card>

          {/* Reject Section */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">
                Reject Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Why is this player being rejected? (e.g., practice squad, not fantasy relevant)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <Button
                onClick={handleReject}
                variant="danger"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Player
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

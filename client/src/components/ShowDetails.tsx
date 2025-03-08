import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlayCircle, FastForward } from "lucide-react";
import type { Video } from "@shared/schema";

interface ShowDetailsProps {
  show: Video;
  episodes: Video[];
  onEpisodeSelect: (episode: Video) => void;
  currentEpisode?: Video;
}

export default function ShowDetails({ 
  show, 
  episodes,
  onEpisodeSelect,
  currentEpisode
}: ShowDetailsProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Group episodes by season
  const seasonEpisodes = episodes.reduce((acc, episode) => {
    const season = episode.metadata?.season || 1;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, Video[]>);

  // Get available seasons
  const seasons = Object.keys(seasonEpisodes).map(Number).sort((a, b) => a - b);

  // Get episodes for current season
  const currentSeasonEpisodes = seasonEpisodes[selectedSeason] || [];

  // Auto-select first episode of selected season if none is playing
  useEffect(() => {
    if (!currentEpisode && currentSeasonEpisodes.length > 0) {
      onEpisodeSelect(currentSeasonEpisodes[0]);
    }
  }, [selectedSeason, currentSeasonEpisodes, currentEpisode, onEpisodeSelect]);

  // Find next episode
  const getNextEpisode = () => {
    if (!currentEpisode) return null;
    const currentIndex = currentSeasonEpisodes.findIndex(
      ep => ep.sourceId === currentEpisode.sourceId && 
           ep.metadata?.episode === currentEpisode.metadata?.episode
    );
    return currentSeasonEpisodes[currentIndex + 1];
  };

  const nextEpisode = getNextEpisode();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">{show.title}</CardTitle>
        <Select 
          value={selectedSeason.toString()}
          onValueChange={(value) => setSelectedSeason(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season} value={season.toString()}>
                Season {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {currentSeasonEpisodes.map((episode) => (
              <Button
                key={`${episode.sourceId}-${episode.metadata?.episode}`}
                variant={currentEpisode?.metadata?.episode === episode.metadata?.episode ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => onEpisodeSelect(episode)}
              >
                <PlayCircle className="h-4 w-4" />
                <span className="font-mono text-sm">
                  S{episode.metadata?.season}E{episode.metadata?.episode}
                </span>
                <span className="truncate">{episode.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {nextEpisode && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Next: S{nextEpisode.metadata?.season}E{nextEpisode.metadata?.episode}
            </div>
            <Button
              size="sm"
              onClick={() => onEpisodeSelect(nextEpisode)}
              className="gap-2"
            >
              <FastForward className="h-4 w-4" />
              Play Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

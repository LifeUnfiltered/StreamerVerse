import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlayCircle, FastForward, SkipForward, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [customSeason, setCustomSeason] = useState<string>('1');
  const [customEpisode, setCustomEpisode] = useState<string>('1');

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
  
  // Log for debugging
  console.log('Show details:', show);
  console.log('Episodes count:', episodes.length);
  console.log('Available seasons:', seasons);
  console.log('Selected season:', selectedSeason);

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

  // Function to manually select an episode by season and episode number
  const handleCustomEpisodeSelect = useCallback(() => {
    // Create a custom episode based on the show
    const customSeasonNum = parseInt(customSeason) || 1;
    const customEpisodeNum = parseInt(customEpisode) || 1;
    
    console.log(`Creating custom episode for S${customSeasonNum}E${customEpisodeNum}`);
    
    // Check if we already have this episode in our list
    const existingEpisode = episodes.find(ep => 
      ep.metadata?.season === customSeasonNum && 
      ep.metadata?.episode === customEpisodeNum
    );
    
    if (existingEpisode) {
      console.log('Found existing episode', existingEpisode);
      onEpisodeSelect(existingEpisode);
      return;
    }
    
    // Create a custom episode object if one doesn't exist
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${show.metadata?.imdbId || show.sourceId}-s${customSeasonNum}e${customEpisodeNum}`,
      source: 'vidsrc',
      title: `${show.title} S${customSeasonNum}E${customEpisodeNum}`,
      description: `Season ${customSeasonNum}, Episode ${customEpisodeNum}`,
      thumbnail: show.thumbnail,
      metadata: {
        imdbId: show.metadata?.imdbId,
        type: 'tv',
        tmdbId: show.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${show.metadata?.imdbId || show.sourceId}&season=${customSeasonNum}&episode=${customEpisodeNum}`,
        season: customSeasonNum,
        episode: customEpisodeNum
      },
      chapters: null
    };
    
    console.log('Created custom episode', newEpisode);
    onEpisodeSelect(newEpisode);
  }, [customSeason, customEpisode, show, episodes, onEpisodeSelect]);

  // Function to navigate to next/previous episode
  const navigateEpisode = useCallback((direction: 'prev' | 'next') => {
    if (!currentEpisode) return;
    
    const currentSeason = currentEpisode.metadata?.season || 1;
    const currentEpisodeNum = currentEpisode.metadata?.episode || 1;
    
    let newSeason = currentSeason;
    let newEpisodeNum = currentEpisodeNum;
    
    if (direction === 'next') {
      newEpisodeNum += 1;
    } else {
      newEpisodeNum -= 1;
      if (newEpisodeNum < 1) {
        newSeason -= 1;
        if (newSeason < 1) {
          newSeason = 1;
          newEpisodeNum = 1;
        } else {
          newEpisodeNum = 20; // Assume last episode of previous season
        }
      }
    }
    
    setCustomSeason(newSeason.toString());
    setCustomEpisode(newEpisodeNum.toString());
    
    // Creating the custom episode
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${show.metadata?.imdbId || show.sourceId}-s${newSeason}e${newEpisodeNum}`,
      source: 'vidsrc',
      title: `${show.title} S${newSeason}E${newEpisodeNum}`,
      description: `Season ${newSeason}, Episode ${newEpisodeNum}`,
      thumbnail: show.thumbnail,
      metadata: {
        imdbId: show.metadata?.imdbId,
        type: 'tv',
        tmdbId: show.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${show.metadata?.imdbId || show.sourceId}&season=${newSeason}&episode=${newEpisodeNum}`,
        season: newSeason,
        episode: newEpisodeNum
      },
      chapters: null
    };
    
    console.log(`Navigating ${direction} to:`, newEpisode);
    onEpisodeSelect(newEpisode);
  }, [currentEpisode, show, onEpisodeSelect]);

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
        <Tabs defaultValue="episodes">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="custom">Custom Episode</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes">
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
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm">Season:</p>
                  <Input 
                    type="number" 
                    min="1"
                    value={customSeason}
                    onChange={(e) => setCustomSeason(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Episode:</p>
                  <Input 
                    type="number"
                    min="1"
                    value={customEpisode}
                    onChange={(e) => setCustomEpisode(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={handleCustomEpisodeSelect}
              >
                Play S{customSeason}E{customEpisode}
              </Button>
              
              <div className="flex justify-between mt-4">
                <Badge variant="outline" className="text-muted-foreground">
                  Currently: S{currentEpisode?.metadata?.season || '?'}E{currentEpisode?.metadata?.episode || '?'}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateEpisode('prev')}
                  >
                    <SkipBack className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigateEpisode('next')}
                  >
                    Next
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
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

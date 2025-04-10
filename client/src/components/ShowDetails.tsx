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
  // If no show is provided but we have a currentEpisode, use that
  const displayShow = show || currentEpisode;
  if (!displayShow) {
    return null;
  }
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
  
  // If the current episode has a season, make sure we're on that season
  useEffect(() => {
    if (currentEpisode?.metadata?.season) {
      setSelectedSeason(currentEpisode.metadata.season);
    }
  }, [currentEpisode]);
  
  // Log for debugging
  console.log('Show details:', show);
  console.log('Episodes count:', episodes.length);
  console.log('Available seasons:', seasons);
  console.log('Selected season:', selectedSeason);
  console.log('Current episode:', currentEpisode?.title);

  // Get episodes for current season
  const currentSeasonEpisodes = seasonEpisodes[selectedSeason] || [];
  
  // If we have an empty season but a valid current episode, create a simulated episode list
  // This helps when an individual episode is selected but we don't have the full list yet
  const hasEpisodes = currentSeasonEpisodes.length > 0;
  const displayEpisodes = hasEpisodes ? currentSeasonEpisodes : (
    currentEpisode?.metadata?.season === selectedSeason ? 
    // Create a simulated list with the current episode
    [currentEpisode] : 
    []
  );

  // Auto-select first episode of selected season if none is playing
  useEffect(() => {
    if (!currentEpisode && currentSeasonEpisodes.length > 0) {
      onEpisodeSelect(currentSeasonEpisodes[0]);
    }
  }, [selectedSeason, currentSeasonEpisodes, currentEpisode, onEpisodeSelect]);

  // Find next episode
  const getNextEpisode = () => {
    if (!currentEpisode) return null;
    
    // If we have a list of episodes, try to find the next one in the list
    if (currentSeasonEpisodes.length > 0) {
      const currentIndex = currentSeasonEpisodes.findIndex(
        ep => ep.sourceId === currentEpisode.sourceId && 
             ep.metadata?.episode === currentEpisode.metadata?.episode
      );
      return currentSeasonEpisodes[currentIndex + 1];
    }
    
    // If we don't have a list, calculate the next episode based on the current one
    if (currentEpisode?.metadata?.season && currentEpisode?.metadata?.episode) {
      const nextEpisodeNum = currentEpisode.metadata.episode + 1;
      
      // Try to find the next episode in our episodes list
      const existingEpisode = episodes.find(ep => 
        ep.metadata?.season === currentEpisode.metadata?.season && 
        ep.metadata?.episode === nextEpisodeNum
      );
      
      if (existingEpisode) {
        return existingEpisode;
      }
      
      // If no existing episode is found, create one with proper title formatting
      
      // The expected format is either:
      // "Show Title S#E# - Episode Title" or "S#E# - Episode Title"
      // We need to extract the episode title part and build a new title with it
      
      // First try to extract "Episode Title" from show name format
      const titleParts = currentEpisode.title.split(' - ');
      const episodeTitle = titleParts.length > 1 ? titleParts[1] : '';
      
      // Build the new title
      const newTitle = `${displayShow.title} S${currentEpisode.metadata?.season}E${nextEpisodeNum} - ${episodeTitle}`;
      
      return {
        id: 0,
        sourceId: `${displayShow.metadata?.imdbId || displayShow.sourceId}-s${currentEpisode.metadata?.season}e${nextEpisodeNum}`,
        source: 'vidsrc',
        title: newTitle,
        description: `Season ${currentEpisode.metadata?.season}, Episode ${nextEpisodeNum}`,
        thumbnail: displayShow.thumbnail,
        metadata: {
          imdbId: displayShow.metadata?.imdbId,
          type: 'tv',
          tmdbId: displayShow.metadata?.tmdbId,
          embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${displayShow.metadata?.imdbId || displayShow.sourceId}&season=${currentEpisode.metadata?.season}&episode=${nextEpisodeNum}`,
          season: currentEpisode.metadata?.season,
          episode: nextEpisodeNum
        },
        chapters: null
      };
    }
    
    return null;
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
    // Try to use the episode title format from existing episodes if possible
    
    // The expected format is either:
    // "Show Title S#E# - Episode Title" or "S#E# - Episode Title"
    // We need to extract the episode title part and build a new title with it
    
    // Extract "Episode Title" part if available
    let episodeTitle = '';
    
    if (currentEpisode?.title) {
      const titleParts = currentEpisode.title.split(' - ');
      if (titleParts.length > 1) {
        episodeTitle = titleParts[1];
      }
    }
    
    // Build the new title - include show name for full format
    const newTitle = `${displayShow.title} S${customSeasonNum}E${customEpisodeNum}${episodeTitle ? ' - ' + episodeTitle : ''}`;
    
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${displayShow.metadata?.imdbId || displayShow.sourceId}-s${customSeasonNum}e${customEpisodeNum}`,
      source: 'vidsrc',
      title: newTitle,
      description: `Season ${customSeasonNum}, Episode ${customEpisodeNum}`,
      thumbnail: displayShow.thumbnail,
      metadata: {
        imdbId: displayShow.metadata?.imdbId,
        type: 'tv',
        tmdbId: displayShow.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${displayShow.metadata?.imdbId || displayShow.sourceId}&season=${customSeasonNum}&episode=${customEpisodeNum}`,
        season: customSeasonNum,
        episode: customEpisodeNum
      },
      chapters: null
    };
    
    console.log('Created custom episode', newEpisode);
    onEpisodeSelect(newEpisode);
  }, [customSeason, customEpisode, displayShow, episodes, onEpisodeSelect]);

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
    
    // First try to find the actual episode in the episodes list
    const existingEpisode = episodes.find(ep => 
      ep.metadata?.season === newSeason && 
      ep.metadata?.episode === newEpisodeNum
    );
    
    if (existingEpisode) {
      console.log('Found existing episode for navigation', existingEpisode);
      return existingEpisode;
    }
    
    // If we couldn't find the exact episode, create a custom one
    // Try to keep a consistent naming format
    
    // The expected format is either:
    // "Show Title S#E# - Episode Title" or "S#E# - Episode Title"
    // We need to extract the episode title part and build a new title with it
    
    // Extract "Episode Title" part if available
    let episodeTitle = '';
    
    if (currentEpisode.title) {
      const titleParts = currentEpisode.title.split(' - ');
      if (titleParts.length > 1) {
        episodeTitle = titleParts[1];
      }
    }
    
    // Build the new title - include show name for full format  
    const newTitle = `${displayShow.title} S${newSeason}E${newEpisodeNum}${episodeTitle ? ' - ' + episodeTitle : ''}`;
    
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${displayShow.metadata?.imdbId || displayShow.sourceId}-s${newSeason}e${newEpisodeNum}`,
      source: 'vidsrc',
      title: baseTitle,
      description: `Season ${newSeason}, Episode ${newEpisodeNum}`,
      thumbnail: displayShow.thumbnail,
      metadata: {
        imdbId: displayShow.metadata?.imdbId,
        type: 'tv',
        tmdbId: displayShow.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${displayShow.metadata?.imdbId || displayShow.sourceId}&season=${newSeason}&episode=${newEpisodeNum}`,
        season: newSeason,
        episode: newEpisodeNum
      },
      chapters: null
    };
    
    console.log(`Navigating ${direction} to:`, newEpisode);
    onEpisodeSelect(newEpisode);
  }, [currentEpisode, displayShow, episodes, onEpisodeSelect]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">{displayShow.title}</CardTitle>
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
                {displayEpisodes.length > 0 ? (
                  displayEpisodes.map((episode) => (
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
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    {currentEpisode ? (
                      <p>Currently playing: {currentEpisode.title}</p>
                    ) : (
                      <p>No episodes available for this season</p>
                    )}
                  </div>
                )}
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

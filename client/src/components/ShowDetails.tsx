import { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlayCircle, FastForward, SkipForward, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Video } from "@shared/schema";

// Utility type to hold consistent episode titles
interface EpisodeTitleCache {
  [key: string]: string; // key format: "show-imdbId-seasonNum-episodeNum"
}

interface ShowDetailsProps {
  show?: Video;
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
  // ALL HOOKS MUST BE AT THE VERY TOP (Rules of Hooks)
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [customSeason, setCustomSeason] = useState<string>('1');
  const [customEpisode, setCustomEpisode] = useState<string>('1');
  const episodeTitleCacheRef = useRef<EpisodeTitleCache>({});
  const episodeDescriptionCacheRef = useRef<EpisodeTitleCache>({});
  
  // If no show is provided but we have a currentEpisode, use that
  const displayShow = show || currentEpisode;
  
  // ALL useCallback hooks MUST be here too
  const fetchEpisodeData = useCallback((episodes: Video[]) => {
    if (!episodes.length) return;
    
    const showId = displayShow?.metadata?.imdbId || displayShow?.sourceId;
    if (!showId) return;
    
    console.log('Fetching episode data from API for show ID:', showId);
    
    // Go through all episodes and cache their titles and descriptions
    episodes.forEach(episode => {
      if (episode.metadata?.season && episode.metadata?.episode) {
        const season = episode.metadata.season;
        const episodeNum = episode.metadata.episode;
        const cacheKey = `${showId}-s${season}e${episodeNum}`;
        
        // Try to extract the episode title
        let episodeTitle = '';
        
        // Check if the title follows the pattern "Show Name S1E1 - Episode Title"
        if (episode.title && episode.title.includes(' - ')) {
          const parts = episode.title.split(' - ');
          if (parts.length > 1) {
            episodeTitle = parts[1];
          }
        }
        
        // If we found a title, store it in the cache
        if (episodeTitle) {
          episodeTitleCacheRef.current[cacheKey] = episodeTitle;
          console.log(`Cached episode title: ${cacheKey} = "${episodeTitle}"`);
        }
        
        // Cache description if it's not generic
        if (episode.description && 
            episode.description !== `Season ${season}, Episode ${episodeNum}` &&
            !episode.description.startsWith("Season ") && 
            !episode.description.startsWith("S")) {
          episodeDescriptionCacheRef.current[cacheKey] = episode.description;
          console.log(`Cached episode description: ${cacheKey} = "${episode.description}"`);
        }
      }
    });
    
    const cachedTitles = Object.keys(episodeTitleCacheRef.current).length;
    const cachedDescriptions = Object.keys(episodeDescriptionCacheRef.current).length;
    console.log(`Cached episode titles available: ${cachedTitles}`);
    console.log(`Cached episode descriptions available: ${cachedDescriptions}`);
  }, [displayShow]);

  const handleCustomEpisodeSelect = useCallback(() => {
    const season = parseInt(customSeason);
    const episodeNum = parseInt(customEpisode);
    
    if (isNaN(season) || isNaN(episodeNum) || season < 1 || episodeNum < 1) {
      return;
    }
    
    const targetEpisode = episodes.find(ep => 
      ep.metadata?.season === season && ep.metadata?.episode === episodeNum
    );
    
    if (targetEpisode) {
      onEpisodeSelect(targetEpisode);
    }
  }, [customSeason, customEpisode, episodes, onEpisodeSelect]);

  const navigateEpisode = useCallback((direction: 'prev' | 'next') => {
    if (!currentEpisode?.metadata?.season || !currentEpisode?.metadata?.episode) return;
    
    const currentSeason = currentEpisode.metadata.season;
    const currentEp = currentEpisode.metadata.episode;
    
    let targetSeason = currentSeason;
    let targetEpisode = currentEp;
    
    if (direction === 'next') {
      const seasonEpisodes = episodes.filter(ep => ep.metadata?.season === currentSeason);
      const maxEpisode = Math.max(...seasonEpisodes.map(ep => ep.metadata?.episode || 0));
      
      if (currentEp < maxEpisode) {
        targetEpisode = currentEp + 1;
      } else {
        const nextSeason = currentSeason + 1;
        const nextSeasonEpisodes = episodes.filter(ep => ep.metadata?.season === nextSeason);
        if (nextSeasonEpisodes.length > 0) {
          targetSeason = nextSeason;
          targetEpisode = 1;
        }
      }
    } else {
      if (currentEp > 1) {
        targetEpisode = currentEp - 1;
      } else {
        const prevSeason = currentSeason - 1;
        if (prevSeason >= 1) {
          const prevSeasonEpisodes = episodes.filter(ep => ep.metadata?.season === prevSeason);
          if (prevSeasonEpisodes.length > 0) {
            targetSeason = prevSeason;
            targetEpisode = Math.max(...prevSeasonEpisodes.map(ep => ep.metadata?.episode || 0));
          }
        }
      }
    }
    
    const targetEpisodeData = episodes.find(ep => 
      ep.metadata?.season === targetSeason && ep.metadata?.episode === targetEpisode
    );
    
    if (targetEpisodeData) {
      onEpisodeSelect(targetEpisodeData);
    }
  }, [currentEpisode, episodes, onEpisodeSelect]);

  // ALL useEffect hooks MUST be here too
  useEffect(() => {
    if (episodes.length > 0) {
      fetchEpisodeData(episodes);
    }
  }, [episodes, fetchEpisodeData]);

  useEffect(() => {
    if (currentEpisode?.metadata?.season) {
      setSelectedSeason(currentEpisode.metadata.season);
      setCustomSeason(currentEpisode.metadata.season.toString());
      setCustomEpisode((currentEpisode.metadata.episode || 1).toString());
    }
  }, [currentEpisode]);

  useEffect(() => {
    if (episodes.length > 0 && selectedSeason) {
      const seasonEpisodes = episodes.filter(ep => ep.metadata?.season === selectedSeason);
      if (seasonEpisodes.length === 0 && episodes.length > 0) {
        const firstSeason = Math.min(...episodes.map(ep => ep.metadata?.season || 1));
        setSelectedSeason(firstSeason);
      }
    }
  }, [episodes, selectedSeason]);
  
  // Debug logging
  console.log('🎭 ShowDetails render:', { 
    hasShow: !!show, 
    hasCurrentEpisode: !!currentEpisode,
    episodesCount: episodes.length,
    showTitle: show?.title || currentEpisode?.title,
    firstFewEpisodes: episodes.slice(0, 3).map(ep => ({ 
      title: ep.title, 
      season: ep.metadata?.season, 
      episode: ep.metadata?.episode 
    }))
  });
  
  if (!displayShow) {
    console.log('🎭 ShowDetails: No display show available');
    return null;
  }
  
  // Force episodes to show if we have episodes data
  if (episodes.length === 0) {
    console.log('🎭 ShowDetails: No episodes available yet');
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Loading episodes...</p>
      </div>
    );
  }
  
  console.log('🎭 ShowDetails: RENDERING EPISODES INTERFACE with', episodes.length, 'episodes');

  // Helper function to get a key for the cache
  const getEpisodeKey = (showId: string, season: number, episode: number) => {
    return `${showId}-s${season}e${episode}`;
  };

  // Extract "real" episode title from any format
  const extractEpisodeTitle = (fullTitle: string): string => {
    // Check for the format: "Show Title S1E1 - Episode Title"
    const titleParts = fullTitle.split(' - ');
    if (titleParts.length > 1) {
      return titleParts[1];
    }
    
    // If we couldn't find a title with a dash, just return empty string
    return '';
  };

  // Format an episode title consistently
  const formatEpisodeTitle = (
    showTitle: string, 
    season: number, 
    episode: number, 
    episodeTitle: string = ''
  ): string => {
    const seasonEpisodeText = `S${season}E${episode}`;
    if (episodeTitle) {
      return `${showTitle} ${seasonEpisodeText} - ${episodeTitle}`;
    } else {
      return `${showTitle} ${seasonEpisodeText}`;
    }
  };

  // Debug logging for episodes and seasons
  console.log('🎭 ShowDetails DEBUG:', {
    totalEpisodes: episodes.length,
    selectedSeason,
    episodesWithSeasonData: episodes.filter(ep => ep.metadata?.season).length,
    seasonNumbers: episodes.map(ep => ep.metadata?.season).filter(Boolean),
    sampleEpisode: episodes[0]?.metadata
  });

  // Get all seasons available
  const availableSeasons = Array.from(new Set(episodes.map(ep => ep.metadata?.season || 1))).sort((a, b) => a - b);
  
  // Get episodes for the selected season
  const seasonEpisodes = episodes.filter(ep => ep.metadata?.season === selectedSeason).sort((a, b) => (a.metadata?.episode || 0) - (b.metadata?.episode || 0));

  console.log('🎭 ShowDetails FILTERING:', {
    availableSeasons,
    selectedSeason,
    seasonEpisodesCount: seasonEpisodes.length,
    allSeasonsCount: availableSeasons.map(s => ({ 
      season: s, 
      count: episodes.filter(ep => ep.metadata?.season === s).length 
    }))
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="episodes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="episodes" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="season-select" className="text-sm font-medium">Season:</label>
              <Select 
                value={selectedSeason.toString()} 
                onValueChange={(value) => {
                  console.log('🎭 Season dropdown changed:', value);
                  const newSeason = parseInt(value);
                  setSelectedSeason(newSeason);
                  console.log('🎭 Selected season updated to:', newSeason);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSeasons.map(season => (
                    <SelectItem key={`season-${season}`} value={season.toString()}>
                      Season {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {seasonEpisodes.length} episodes available
            </div>
          </div>
          
          <ScrollArea className="h-96 w-full">
            <div className="grid gap-2">
              {seasonEpisodes.map(episode => {
                const isCurrentEpisode = currentEpisode?.sourceId === episode.sourceId;
                const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
                const episodeKey = getEpisodeKey(showId, episode.metadata?.season || 1, episode.metadata?.episode || 1);
                const cachedTitle = episodeTitleCacheRef.current[episodeKey];
                const cachedDescription = episodeDescriptionCacheRef.current[episodeKey];
                
                return (
                  <Card 
                    key={episode.sourceId || `ep-${episode.metadata?.season || 1}-${episode.metadata?.episode || 1}`} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${isCurrentEpisode ? 'bg-primary/10 border-primary' : ''}`}
                    onClick={() => onEpisodeSelect(episode)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <PlayCircle className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              S{episode.metadata?.season}E{episode.metadata?.episode}
                            </Badge>
                            {episode.metadata?.voteAverage && (
                              <Badge variant="secondary" className="text-xs">
                                ⭐ {episode.metadata.voteAverage.toFixed(1)}
                              </Badge>
                            )}
                            {isCurrentEpisode && (
                              <Badge variant="default" className="text-xs">
                                Now Playing
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {cachedTitle || extractEpisodeTitle(episode.title) || `Episode ${episode.metadata?.episode}`}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                            {episode.metadata?.airDate && (
                              <span>{new Date(episode.metadata.airDate).toLocaleDateString()}</span>
                            )}
                            {episode.metadata?.runtime && (
                              <span>{episode.metadata.runtime} min</span>
                            )}
                          </div>
                          {(cachedDescription || episode.description) && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {cachedDescription || episode.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{displayShow.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayShow.description && (
                <div>
                  <h4 className="font-medium mb-2">Overview</h4>
                  <p className="text-sm text-muted-foreground">{displayShow.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Total Seasons</h4>
                  <p className="text-sm text-muted-foreground">{availableSeasons.length}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Total Episodes</h4>
                  <p className="text-sm text-muted-foreground">{episodes.length}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {displayShow.metadata?.airDate && (
                  <div>
                    <h4 className="font-medium mb-1">First Air Date</h4>
                    <p className="text-sm text-muted-foreground">{new Date(displayShow.metadata.airDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {displayShow.metadata?.voteAverage && (
                  <div>
                    <h4 className="font-medium mb-1">Rating</h4>
                    <p className="text-sm text-muted-foreground">⭐ {displayShow.metadata.voteAverage}/10</p>
                  </div>
                )}
              </div>

              {displayShow.metadata?.cast && displayShow.metadata.cast.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Cast</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {displayShow.metadata.cast.slice(0, 6).map((actor: any, index: number) => (
                      <div key={`cast-${index}-${actor.name}`} className="flex justify-between">
                        <span className="font-medium">{actor.name}</span>
                        <span className="text-muted-foreground">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayShow.metadata?.crew && displayShow.metadata.crew.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Crew</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {displayShow.metadata.crew.slice(0, 4).map((crewMember: any, index: number) => (
                      <div key={`crew-${index}-${crewMember.name}`} className="flex justify-between">
                        <span className="font-medium">{crewMember.name}</span>
                        <span className="text-muted-foreground">{crewMember.job}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Episode Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentEpisode && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateEpisode('prev')}
                    className="flex items-center gap-2"
                  >
                    <SkipBack className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      S{currentEpisode.metadata?.season}E{currentEpisode.metadata?.episode}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {extractEpisodeTitle(currentEpisode.title) || `Episode ${currentEpisode.metadata?.episode}`}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateEpisode('next')}
                    className="flex items-center gap-2"
                  >
                    Next
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="font-medium">Jump to Episode</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Season"
                    value={customSeason}
                    onChange={(e) => setCustomSeason(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder="Episode"
                    value={customEpisode}
                    onChange={(e) => setCustomEpisode(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Button onClick={handleCustomEpisodeSelect} size="sm">
                    Go
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
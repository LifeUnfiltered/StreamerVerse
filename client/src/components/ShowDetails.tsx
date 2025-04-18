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
  
  // Create a persistent cache for episode titles and descriptions
  const episodeTitleCacheRef = useRef<EpisodeTitleCache>({});
  const episodeDescriptionCacheRef = useRef<EpisodeTitleCache>({});
  
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

  // (We're using the episodeDescriptionCacheRef defined above)

  // Fetch and store episode titles and descriptions from the API data
  const fetchEpisodeData = useCallback((episodes: Video[]) => {
    if (!episodes.length) return;
    
    const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
    
    console.log('Fetching episode data from API for show ID:', showId);
    
    // Go through all episodes and cache their titles and descriptions
    episodes.forEach(episode => {
      if (episode.metadata?.season && episode.metadata?.episode) {
        const season = episode.metadata.season;
        const episodeNum = episode.metadata.episode;
        const cacheKey = getEpisodeKey(showId, season, episodeNum);
        
        // Try to extract the episode title
        let episodeTitle = '';
        
        // Check if the title follows the pattern "Show Name S1E1 - Episode Title"
        if (episode.title && episode.title.includes(' - ')) {
          const parts = episode.title.split(' - ');
          if (parts.length > 1) {
            episodeTitle = parts[1];
          }
        }
        
        // Also check the description if available for episode title
        const isGenericDescription = 
          !episode.description || 
          episode.description === `Season ${season}, Episode ${episodeNum}` ||
          episode.description.startsWith("Season ") || 
          episode.description.startsWith("S");
          
        if (!episodeTitle && !isGenericDescription) {
          // If the description looks like a real description (not just season/episode),
          // we can try to use it as a title if we don't have one
          if (episode.description && episode.description.length < 50) {
            episodeTitle = episode.description;
          }
        }
        
        // If we found a title, store it in the cache
        if (episodeTitle) {
          if (!episodeTitleCacheRef.current[cacheKey]) {
            episodeTitleCacheRef.current[cacheKey] = episodeTitle;
            console.log(`Cached API episode title: ${cacheKey} = "${episodeTitle}"`);
          }
        }
        
        // Store episode description in separate cache if it's a real description
        if (!isGenericDescription && episode.description) {
          episodeDescriptionCacheRef.current[cacheKey] = episode.description;
          console.log(`Cached episode description: ${cacheKey} = "${episode.description}"`);
        } else {
          console.log(`Generic description for ${cacheKey}, attempting to populate from TMDB data...`);
          
          // For seasons other than season 1, attempt to fetch descriptions directly from TMDB if possible
          if (season > 1) {
            // We'll set up a placeholder to be filled in later when the detailed data is fetched
            if (!episodeDescriptionCacheRef.current[cacheKey]) {
              // If we have a title, use it as a description for now, but flag it as a placeholder
              if (episodeTitle) {
                episodeDescriptionCacheRef.current[cacheKey] = episodeTitle;
              }
            }
          }
        }
      }
    });
  }, [displayShow]);
  
  // Format episode titles consistently and include proper descriptions
  const formatEpisodes = (episodeList: Video[]): Video[] => {
    if (!episodeList.length) return [];
    
    const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
    const showTitle = displayShow.title || 'Unknown Show';
    
    // First ensure we've captured all episode titles and descriptions
    fetchEpisodeData(episodeList);
    
    // Print debug info about current episode
    if (currentEpisode?.metadata?.season && currentEpisode?.metadata?.episode) {
      const season = currentEpisode.metadata.season;
      const episodeNum = currentEpisode.metadata.episode;
      const cacheKey = getEpisodeKey(showId, season, episodeNum);
      console.log(`Current episode: ${currentEpisode.title}, Description: ${currentEpisode.description?.substring(0, 50)}...`);
      console.log(`Available cached description: ${episodeDescriptionCacheRef.current[cacheKey]?.substring(0, 50)}...`);
      console.log(`Episodes count:`, episodeList.length);
      console.log(`Available seasons:`, seasons);
      console.log(`Selected season:`, selectedSeason);
      console.log(`Current episode:`, currentEpisode.title);
      console.log(`Fetching episode data from API for show ID:`, showId);
    }
    
    // Check if there are any cached descriptions to use
    const cachedDescriptionKeys = Object.keys(episodeDescriptionCacheRef.current);
    if (cachedDescriptionKeys.length > 0) {
      console.log(`Cached episode descriptions available: ${cachedDescriptionKeys.length}`);
    }
    
    // Process each episode to ensure consistent formatting
    return episodeList.map(episode => {
      if (episode.metadata?.season && episode.metadata?.episode) {
        const season = episode.metadata.season;
        const episodeNum = episode.metadata.episode;
        
        // Create the episode-specific cache key
        const cacheKey = getEpisodeKey(showId, season, episodeNum);
        
        // Look up the correct title for THIS episode (not the current selected one)
        const thisEpisodeTitle = episodeTitleCacheRef.current[cacheKey];
        
        // Format the title consistently with the correct episode title
        const formattedTitle = formatEpisodeTitle(showTitle, season, episodeNum, thisEpisodeTitle || '');
        
        // Check if we have a cached description for this episode
        const thisEpisodeDescription = episodeDescriptionCacheRef.current[cacheKey];
        
        // Create updated episode with cached metadata, preserving ALL original metadata
        const updatedEpisode = {
          ...episode,
          title: formattedTitle,
          metadata: {
            ...episode.metadata,
            // Make sure we preserve runtime and ratings from the original show
            runtime: episode.metadata?.runtime || displayShow?.metadata?.runtime,
            contentRating: episode.metadata?.contentRating || displayShow?.metadata?.contentRating,
            voteAverage: episode.metadata?.voteAverage
          }
        };
        
        // Apply cached description if available
        if (thisEpisodeDescription) {
          updatedEpisode.description = thisEpisodeDescription;
        }
        
        // If this is the current episode, make sure to use the parent component's cached description
        if (currentEpisode && 
            currentEpisode.metadata?.season === season && 
            currentEpisode.metadata?.episode === episodeNum && 
            currentEpisode.description) {
          
          // Update our local cache with the latest description from the parent component
          episodeDescriptionCacheRef.current[cacheKey] = currentEpisode.description;
          updatedEpisode.description = currentEpisode.description;
        }
        
        return updatedEpisode;
      }
      
      // Return original episode if no special formatting needed
      return episode;
    });
  };

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
  
  // Populate the title cache from episodes when they are loaded
  useEffect(() => {
    const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
    
    // Process all episodes and store their titles in the cache
    episodes.forEach(episode => {
      if (episode.metadata?.season && episode.metadata?.episode) {
        const season = episode.metadata.season;
        const episodeNum = episode.metadata.episode;
        const episodeTitle = extractEpisodeTitle(episode.title);
        
        // Only store if we have a real title (not empty)
        if (episodeTitle) {
          const cacheKey = getEpisodeKey(showId, season, episodeNum);
          episodeTitleCacheRef.current[cacheKey] = episodeTitle;
          console.log(`Cached episode title: ${cacheKey} = "${episodeTitle}"`);
        }
      }
    });
    
    // Also cache current episode if available
    if (currentEpisode?.metadata?.season && currentEpisode?.metadata?.episode) {
      const episodeTitle = extractEpisodeTitle(currentEpisode.title);
      if (episodeTitle) {
        const cacheKey = getEpisodeKey(
          showId, 
          currentEpisode.metadata.season, 
          currentEpisode.metadata.episode
        );
        episodeTitleCacheRef.current[cacheKey] = episodeTitle;
        console.log(`Cached current episode title: ${cacheKey} = "${episodeTitle}"`);
      }
    }
  }, [episodes, displayShow, currentEpisode]);

  // Get episodes for current season
  const currentSeasonEpisodes = seasonEpisodes[selectedSeason] || [];
  
  // If we have an empty season but a valid current episode, create a simulated episode list
  // This helps when an individual episode is selected but we don't have the full list yet
  const hasEpisodes = currentSeasonEpisodes.length > 0;
  
  // Ensure all episode titles are properly formatted with show name and episode titles
  let rawEpisodes = hasEpisodes ? currentSeasonEpisodes : (
    currentEpisode?.metadata?.season === selectedSeason ? 
    // Create a simulated list with the current episode
    [currentEpisode] : 
    []
  );
  
  // Apply consistent formatting to all episodes in the list
  const displayEpisodes = formatEpisodes(rawEpisodes);

  // Auto-select first episode of selected season if none is playing
  useEffect(() => {
    if (!currentEpisode && currentSeasonEpisodes.length > 0) {
      // Always use the original episodes array to get full metadata
      const firstEpisode = currentSeasonEpisodes[0];
      const fullEpisode = episodes.find(e => 
        e.id === firstEpisode.id || 
        (e.sourceId === firstEpisode.sourceId && 
         e.metadata?.season === firstEpisode.metadata?.season && 
         e.metadata?.episode === firstEpisode.metadata?.episode)
      ) || firstEpisode;
      
      onEpisodeSelect(fullEpisode);
    }
  }, [selectedSeason, currentSeasonEpisodes, currentEpisode, episodes, onEpisodeSelect]);

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
      const currentSeason = currentEpisode.metadata.season;
      const nextEpisodeNum = currentEpisode.metadata.episode + 1;
      const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
      
      // Try to find the next episode in our episodes list
      const existingEpisode = episodes.find(ep => 
        ep.metadata?.season === currentSeason && 
        ep.metadata?.episode === nextEpisodeNum
      );
      
      if (existingEpisode) {
        return existingEpisode;
      }
      
      // If no existing episode is found, create one with proper title formatting
      
      // Check our cache first for this episode title
      const cacheKey = getEpisodeKey(showId, currentSeason, nextEpisodeNum);
      let episodeTitle = episodeTitleCacheRef.current[cacheKey];
      
      // If not in cache, try to extract from current episode
      if (!episodeTitle) {
        episodeTitle = extractEpisodeTitle(currentEpisode.title);
        
        // If we found a title, store it in the cache for future use
        if (episodeTitle) {
          episodeTitleCacheRef.current[cacheKey] = episodeTitle;
          console.log(`Caching title for next episode: ${cacheKey} = "${episodeTitle}"`);
        }
      } else {
        console.log(`Using cached title for next episode: ${cacheKey} = "${episodeTitle}"`);
      }
      
      // Format the title consistently
      const newTitle = formatEpisodeTitle(
        displayShow.title, 
        currentSeason, 
        nextEpisodeNum, 
        episodeTitle
      );
      
      return {
        id: 0,
        sourceId: `${showId}-s${currentSeason}e${nextEpisodeNum}`,
        source: 'vidsrc',
        title: newTitle,
        description: `Season ${currentSeason}, Episode ${nextEpisodeNum}`,
        thumbnail: displayShow.thumbnail,
        metadata: {
          imdbId: displayShow.metadata?.imdbId,
          type: 'tv',
          tmdbId: displayShow.metadata?.tmdbId,
          embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${showId}&season=${currentSeason}&episode=${nextEpisodeNum}`,
          season: currentSeason,
          episode: nextEpisodeNum,
          // Preserve these fields from the current episode for consistency
          runtime: currentEpisode.metadata?.runtime,
          contentRating: currentEpisode.metadata?.contentRating,
          voteAverage: currentEpisode.metadata?.voteAverage,
          releaseDate: currentEpisode.metadata?.releaseDate
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
    const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
    
    console.log(`Creating custom episode for S${customSeasonNum}E${customEpisodeNum}`);
    
    // Check if we already have this episode in our list
    const existingEpisode = episodes.find(ep => 
      ep.metadata?.season === customSeasonNum && 
      ep.metadata?.episode === customEpisodeNum
    );
    
    if (existingEpisode) {
      console.log('Found existing episode', existingEpisode);
      // Make sure we get the full episode details
      const fullEpisode = episodes.find(e => 
        e.id === existingEpisode.id || 
        (e.sourceId === existingEpisode.sourceId && 
          e.metadata?.season === existingEpisode.metadata?.season && 
          e.metadata?.episode === existingEpisode.metadata?.episode)
      ) || existingEpisode;
      
      // Create a merged episode that preserves ALL metadata including runtime
      const mergedEpisode = {
        ...fullEpisode,
        // Make sure to preserve formatted title and description
        title: existingEpisode.title || fullEpisode.title,
        description: existingEpisode.description || fullEpisode.description,
        metadata: {
          ...fullEpisode.metadata,
          ...existingEpisode.metadata,
          // Explicitly preserve critical metadata
          runtime: existingEpisode.metadata?.runtime || fullEpisode.metadata?.runtime || displayShow?.metadata?.runtime,
          contentRating: existingEpisode.metadata?.contentRating || fullEpisode.metadata?.contentRating || displayShow?.metadata?.contentRating,
          voteAverage: existingEpisode.metadata?.voteAverage || fullEpisode.metadata?.voteAverage
        }
      };
      
      onEpisodeSelect(mergedEpisode);
      return;
    }
    
    // Create a custom episode object if one doesn't exist
    
    // Check our cache first for this episode title
    const cacheKey = getEpisodeKey(showId, customSeasonNum, customEpisodeNum);
    let episodeTitle = episodeTitleCacheRef.current[cacheKey];
    
    // If not in cache, try to extract from current episode or use most recent knowledge
    if (!episodeTitle && currentEpisode?.title) {
      episodeTitle = extractEpisodeTitle(currentEpisode.title);
      
      // If we found a title, store it in the cache for future use
      if (episodeTitle) {
        episodeTitleCacheRef.current[cacheKey] = episodeTitle;
        console.log(`Caching title for custom episode: ${cacheKey} = "${episodeTitle}"`);
      }
    } else if (episodeTitle) {
      console.log(`Using cached title for custom episode: ${cacheKey} = "${episodeTitle}"`);
    }
    
    // Format the title consistently
    const newTitle = formatEpisodeTitle(
      displayShow.title, 
      customSeasonNum, 
      customEpisodeNum, 
      episodeTitle
    );
    
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${showId}-s${customSeasonNum}e${customEpisodeNum}`,
      source: 'vidsrc',
      title: newTitle,
      description: `Season ${customSeasonNum}, Episode ${customEpisodeNum}`,
      thumbnail: displayShow.thumbnail,
      metadata: {
        imdbId: displayShow.metadata?.imdbId,
        type: 'tv',
        tmdbId: displayShow.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${showId}&season=${customSeasonNum}&episode=${customEpisodeNum}`,
        season: customSeasonNum,
        episode: customEpisodeNum,
        // Preserve these fields from the parent show or current episode for consistency
        runtime: currentEpisode?.metadata?.runtime || displayShow.metadata?.runtime,
        contentRating: displayShow.metadata?.contentRating || currentEpisode?.metadata?.contentRating,
        voteAverage: currentEpisode?.metadata?.voteAverage || displayShow.metadata?.voteAverage,
        releaseDate: currentEpisode?.metadata?.releaseDate
      },
      chapters: null
    };
    
    console.log('Created custom episode', newEpisode);
    onEpisodeSelect(newEpisode);
  }, [customSeason, customEpisode, displayShow, episodes, currentEpisode, onEpisodeSelect]);

  // Function to navigate to next/previous episode
  const navigateEpisode = useCallback((direction: 'prev' | 'next') => {
    if (!currentEpisode) return;
    
    const currentSeason = currentEpisode.metadata?.season || 1;
    const currentEpisodeNum = currentEpisode.metadata?.episode || 1;
    const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
    
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
      // Make sure we get the full episode details
      const fullEpisode = episodes.find(e => 
        e.id === existingEpisode.id || 
        (e.sourceId === existingEpisode.sourceId && 
          e.metadata?.season === existingEpisode.metadata?.season && 
          e.metadata?.episode === existingEpisode.metadata?.episode)
      ) || existingEpisode;
      
      // Create a merged episode that preserves ALL metadata
      const mergedEpisode = {
        ...fullEpisode,
        title: existingEpisode.title || fullEpisode.title,
        description: existingEpisode.description || fullEpisode.description,
        metadata: {
          ...fullEpisode.metadata,
          ...existingEpisode.metadata,
          // Explicitly preserve runtime and content rating
          runtime: existingEpisode.metadata?.runtime || fullEpisode.metadata?.runtime || currentEpisode?.metadata?.runtime,
          contentRating: existingEpisode.metadata?.contentRating || fullEpisode.metadata?.contentRating || currentEpisode?.metadata?.contentRating,
          voteAverage: existingEpisode.metadata?.voteAverage || fullEpisode.metadata?.voteAverage
        }
      };
      
      onEpisodeSelect(mergedEpisode);
      return;
    }
    
    // If we couldn't find the exact episode, create a custom one
    
    // Check our cache first for this episode title
    const cacheKey = getEpisodeKey(showId, newSeason, newEpisodeNum);
    let episodeTitle = episodeTitleCacheRef.current[cacheKey];
    
    // If not in cache, try to extract from current episode
    if (!episodeTitle && currentEpisode.title) {
      episodeTitle = extractEpisodeTitle(currentEpisode.title);
      
      // If we found a title, store it in the cache for future use
      if (episodeTitle) {
        episodeTitleCacheRef.current[cacheKey] = episodeTitle;
        console.log(`Caching title for navigation: ${cacheKey} = "${episodeTitle}"`);
      }
    } else if (episodeTitle) {
      console.log(`Using cached title for navigation: ${cacheKey} = "${episodeTitle}"`);
    }
    
    // Format the title consistently
    const newTitle = formatEpisodeTitle(
      displayShow.title, 
      newSeason, 
      newEpisodeNum, 
      episodeTitle
    );
    
    const newEpisode = {
      id: 0, // This will be ignored since we're not persisting
      sourceId: `${showId}-s${newSeason}e${newEpisodeNum}`,
      source: 'vidsrc',
      title: newTitle,
      description: `Season ${newSeason}, Episode ${newEpisodeNum}`,
      thumbnail: displayShow.thumbnail,
      metadata: {
        imdbId: displayShow.metadata?.imdbId,
        type: 'tv',
        tmdbId: displayShow.metadata?.tmdbId,
        embedUrl: `https://vidsrc.xyz/embed/tv?imdb=${showId}&season=${newSeason}&episode=${newEpisodeNum}`,
        season: newSeason,
        episode: newEpisodeNum,
        // Preserve these fields from the current episode for consistency
        runtime: currentEpisode.metadata?.runtime || displayShow?.metadata?.runtime,
        contentRating: currentEpisode.metadata?.contentRating || displayShow?.metadata?.contentRating,
        voteAverage: currentEpisode.metadata?.voteAverage || displayShow?.metadata?.voteAverage,
        releaseDate: currentEpisode.metadata?.releaseDate
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
                      onClick={() => {
                        // Find the complete episode in the original episode list to preserve all metadata
                        const fullEpisode = episodes.find(e => 
                          e.id === episode.id || 
                          (e.sourceId === episode.sourceId && 
                          e.metadata?.season === episode.metadata?.season && 
                          e.metadata?.episode === episode.metadata?.episode)
                        ) || episode;
                        
                        // Create a version that merges formatted data with original metadata
                        const mergedEpisode = {
                          ...fullEpisode,
                          title: episode.title, // Keep our formatted title
                          description: episode.description || fullEpisode.description,
                          // Most importantly, ensure runtime and other metadata are preserved from both sources
                          metadata: {
                            ...fullEpisode.metadata,
                            ...episode.metadata,
                            // Explicitly preserve critical metadata
                            runtime: episode.metadata?.runtime || fullEpisode.metadata?.runtime,
                            contentRating: episode.metadata?.contentRating || fullEpisode.metadata?.contentRating
                          }
                        };
                        
                        onEpisodeSelect(mergedEpisode);
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span className="font-mono text-sm">
                        S{episode.metadata?.season}E{episode.metadata?.episode}
                      </span>
                      {/* Extract and display just the unique episode name without show name */}
                      <span className="truncate flex-grow">
                        {episode.metadata?.season && episode.metadata?.episode ? (
                          <>
                            {(() => {
                              // Get the correct episode title from our cache
                              const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
                              const cacheKey = getEpisodeKey(showId, episode.metadata.season, episode.metadata.episode);
                              const episodeTitle = episodeTitleCacheRef.current[cacheKey];
                              
                              return episodeTitle ? `- ${episodeTitle}` : 
                                (episode.title && episode.title.includes(' - ') ? 
                                  `- ${episode.title.split(' - ')[1]}` : 
                                  episode.title);
                            })()}
                          </>
                        ) : (
                          episode.title
                        )}
                      </span>
                      {/* Show rating, date, runtime, and content rating when available */}
                      <div className="flex items-center ml-auto gap-1">
                        {episode.metadata?.runtime && (
                          <Badge variant="outline" className="text-xs">
                            {episode.metadata.runtime} min
                          </Badge>
                        )}
                        {episode.metadata?.contentRating && (
                          <Badge variant="outline" className="text-xs">
                            {episode.metadata.contentRating}
                          </Badge>
                        )}
                        {episode.metadata?.voteAverage && (
                          <Badge variant="secondary">
                            {episode.metadata.voteAverage.toFixed(1)}★
                          </Badge>
                        )}
                        {episode.metadata?.releaseDate && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {new Date(episode.metadata.releaseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
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
            <div className="text-sm">
              <div className="flex items-center">
                <span className="text-muted-foreground">
                  Next: S{nextEpisode.metadata?.season}E{nextEpisode.metadata?.episode}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  {nextEpisode.metadata?.runtime && (
                    <Badge variant="outline" className="text-xs">
                      {nextEpisode.metadata.runtime} min
                    </Badge>
                  )}
                  {nextEpisode.metadata?.contentRating && (
                    <Badge variant="outline" className="text-xs">
                      {nextEpisode.metadata.contentRating}
                    </Badge>
                  )}
                  {nextEpisode.metadata?.voteAverage && (
                    <Badge variant="secondary">
                      {nextEpisode.metadata.voteAverage.toFixed(1)}★
                    </Badge>
                  )}
                </div>
              </div>
              {(() => {
                const showId = displayShow.metadata?.imdbId || displayShow.sourceId;
                const cacheKey = getEpisodeKey(
                  showId, 
                  nextEpisode.metadata?.season || 1, 
                  nextEpisode.metadata?.episode || 1
                );
                const episodeTitle = episodeTitleCacheRef.current[cacheKey];
                
                return episodeTitle ? (
                  <div className="font-medium">{episodeTitle}</div>
                ) : (
                  nextEpisode.title && nextEpisode.title.includes(' - ') && (
                    <div className="font-medium">{nextEpisode.title.split(' - ')[1]}</div>
                  )
                );
              })()}
              {nextEpisode.metadata?.voteAverage && nextEpisode.metadata?.releaseDate && (
                <div className="text-xs text-muted-foreground">
                  {new Date(nextEpisode.metadata.releaseDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => {
                // Find the complete episode in the original episode list to preserve all metadata
                const fullEpisode = episodes.find(e => 
                  e.id === nextEpisode.id || 
                  (e.sourceId === nextEpisode.sourceId && 
                  e.metadata?.season === nextEpisode.metadata?.season && 
                  e.metadata?.episode === nextEpisode.metadata?.episode)
                ) || nextEpisode;
                
                // Merge data to ensure both formatted title and runtime are preserved
                const mergedEpisode = {
                  ...fullEpisode,
                  title: nextEpisode.title || fullEpisode.title,
                  description: nextEpisode.description || fullEpisode.description,
                  metadata: {
                    ...fullEpisode.metadata,
                    ...nextEpisode.metadata,
                    // Explicitly ensure runtime and ratings are preserved
                    runtime: nextEpisode.metadata?.runtime || fullEpisode.metadata?.runtime,
                    contentRating: nextEpisode.metadata?.contentRating || fullEpisode.metadata?.contentRating,
                    voteAverage: nextEpisode.metadata?.voteAverage || fullEpisode.metadata?.voteAverage
                  }
                };
                
                onEpisodeSelect(mergedEpisode);
              }}
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

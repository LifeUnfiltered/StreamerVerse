import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthDialog from "@/components/AuthDialog";
import SearchBar from "@/components/SearchBar";
import ShowDetails from "@/components/ShowDetails";
import SourceSelector from "@/components/SourceSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import BackButton from "@/components/BackButton";

interface NavigationState {
  view: 'browse' | 'search' | 'watchlist' | 'video';
  previousView: 'browse' | 'search' | 'watchlist' | 'video' | null;
}

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSource, setCurrentSource] = useState<'youtube' | 'vidsrc'>('vidsrc');
  const [navigation, setNavigation] = useState<NavigationState>({ 
    view: 'browse',
    previousView: null 
  });
  const queryClient = useQueryClient();

  // Watchlist query
  const { data: watchlist } = useQuery<Video[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/watchlist');
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch watchlist');
        }
        return response.json();
      } catch (error) {
        console.error('Watchlist error:', error);
        throw error;
      }
    },
    retry: false
  });

  // Latest content queries
  const { data: movies, isLoading: moviesLoading, error: moviesError } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/movies', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/movies?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery && currentSource === 'vidsrc' && navigation.view === 'browse'
  });

  const { data: shows, isLoading: showsLoading, error: showsError } = useQuery<Video[]>({
    queryKey: ['/api/videos/test-tv'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/test-tv');
      return response.json();
    },
    enabled: !searchQuery && currentSource === 'vidsrc' && navigation.view === 'browse'
  });

  const { data: episodes } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/episodes', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/episodes?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery && !!selectedVideo && currentSource === 'vidsrc'
  });

  // Search query
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery<Video[]>({
    queryKey: [currentSource === 'youtube' ? '/api/videos/search' : '/api/videos/vidsrc/search', searchQuery, currentSource],
    queryFn: async () => {
      const endpoint = currentSource === 'youtube'
        ? `/api/videos/search?query=${encodeURIComponent(searchQuery)}&source=youtube`
        : `/api/videos/vidsrc/search?query=${encodeURIComponent(searchQuery)}`;
      const response = await apiRequest('GET', endpoint);
      return response.json();
    },
    enabled: searchQuery.length > 0
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
    setNavigation({ view: 'search', previousView: navigation.view === 'search' ? navigation.previousView : navigation.view });
  };

  const handleSourceSelect = (source: 'youtube' | 'vidsrc') => {
    setCurrentSource(source);
    setSelectedVideo(null);
    setSearchQuery('');
    setNavigation({ view: 'browse', previousView: null });
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
  };

  const handleWatchlistClick = () => {
    setNavigation({ 
      view: 'watchlist',
      previousView: navigation.view === 'watchlist' ? navigation.previousView : navigation.view
    });
    setSearchQuery('');
  };

  const handleVideoSelect = (video: Video) => {
    // Apply cached episode title if available for selected episode
    let updatedVideo = { ...video };
    
    // Only process TV episodes
    if (video.metadata?.type === 'tv' && video.metadata?.season && video.metadata?.episode) {
      const showId = video.metadata?.imdbId || video.sourceId?.split('-')[0];
      const season = video.metadata.season;
      const episodeNum = video.metadata.episode;
      
      // Check if this episode has a cached title
      if (showId) {
        const cacheKey = getEpisodeKey(showId, season, episodeNum);
        const cachedTitle = episodeTitleCache.get(cacheKey);
        
        // If we have a cached title and the current title doesn't have it
        if (cachedTitle) {
          // Get the show title - either from currentShow or from the video title
          let showTitle = currentShow?.title || '';
          if (!showTitle && video.title && video.title.includes(`S${season}E${episodeNum}`)) {
            const titleParts = video.title.split(`S${season}E${episodeNum}`);
            if (titleParts.length > 0) {
              showTitle = titleParts[0].trim();
            }
          }
          
          // Default to a generic show title if we couldn't extract one
          if (!showTitle) {
            showTitle = 'Show';
          }
          
          // Create a formatted title
          const newTitle = formatEpisodeTitle(showTitle, season, episodeNum, cachedTitle);
          console.log(`Applying cached title: "${video.title}" → "${newTitle}"`);
          
          // Update the video with the formatted title
          updatedVideo.title = newTitle;
        } 
        // If we don't have a cached title but the video has one in the proper format, cache it
        else if (video.title && video.title.includes(' - ')) {
          const titleParts = video.title.split(' - ');
          if (titleParts.length > 1) {
            const extractedTitle = titleParts[1];
            episodeTitleCache.set(cacheKey, extractedTitle);
            console.log(`Caching title from selected video: ${cacheKey} = "${extractedTitle}"`);
          }
        }
        // If we have a generic title, try to apply a better format
        else if (video.title && video.title.includes('Season') && video.title.includes('Episode')) {
          // Get the show title from the current show
          const showTitle = currentShow?.title || 'Show';
          // Create a better formatted title (without episode title)
          const newTitle = formatEpisodeTitle(showTitle, season, episodeNum);
          console.log(`Formatting generic title: "${video.title}" → "${newTitle}"`);
          updatedVideo.title = newTitle;
        }
      }
    }
    
    // Update the selected video
    setSelectedVideo(updatedVideo);
    setNavigation({ 
      view: 'video',
      previousView: navigation.view
    });
  };

  const handleBack = useCallback(() => {
    if (!navigation.previousView) {
      setNavigation({ view: 'browse', previousView: null });
      setSelectedVideo(null);
      setSearchQuery('');
      return;
    }

    setNavigation({ 
      view: navigation.previousView,
      previousView: null
    });

    if (navigation.previousView === 'browse') {
      setSelectedVideo(null);
      setSearchQuery('');
    }
  }, [navigation]);

  const isLoggedIn = watchlist !== null;

  // Determine if the selected video is a TV show episode or a TV show
  const isSelectedVideoTVShow = selectedVideo && 
    (selectedVideo.metadata?.type === 'tv');
  
  const isSelectedVideoTVEpisode = selectedVideo && 
    (selectedVideo.metadata?.season && selectedVideo.metadata?.episode);
    
  // Store the parent show ID if it's an episode
  const parentShowId = selectedVideo?.metadata?.imdbId;
  
  // Find the proper show object - either:
  // 1. The selected video is the show itself
  // 2. We need to find the parent show for an episode
  // 3. We'll look in the shows array by ID or sourceId
  const currentShow = isSelectedVideoTVShow && !isSelectedVideoTVEpisode ? selectedVideo : 
    (parentShowId && shows?.find(show => 
      show.sourceId === parentShowId || 
      show.metadata?.imdbId === parentShowId
    )) || 
    (selectedVideo && shows?.find(show =>
      show.sourceId === selectedVideo.sourceId || 
      show.metadata?.imdbId === selectedVideo.sourceId
    ));
  
  // Determine what show ID to use for fetching episodes
  // We need to handle both episodes and shows
  let episodeFetchId: string | number | null = null;
  
  // If we have a current show, use its ID or sourceId
  if (currentShow) {
    episodeFetchId = currentShow.id || currentShow.sourceId;
  }
  // If we don't have a current show but have a selected TV episode,
  // use its IMDB ID as a fallback for fetching episodes
  else if (isSelectedVideoTVEpisode && selectedVideo?.metadata?.imdbId) {
    episodeFetchId = selectedVideo.metadata.imdbId;
  }
  
  // Log for debugging
  console.log('Episode fetch ID:', episodeFetchId);
  console.log('Current show:', currentShow);
  console.log('Selected video:', selectedVideo);
  
  // Helper function to format episode titles consistently
  const formatEpisodeTitle = (showTitle: string, season: number, episode: number, episodeTitle: string = '') => {
    const seasonEpisodeText = `S${season}E${episode}`;
    if (episodeTitle) {
      return `${showTitle} ${seasonEpisodeText} - ${episodeTitle}`;
    } else {
      return `${showTitle} ${seasonEpisodeText}`;
    }
  };

  // Maintain a cache of episode titles
  const episodeTitleCache = useMemo(() => new Map<string, string>(), []);

  // Function to get a key for the episode cache
  const getEpisodeKey = (showId: string, season: number, episode: number) => {
    return `${showId}-s${season}e${episode}`;
  };

  // Fetch episodes when a show is selected
  const { data: showEpisodes = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos/tv', episodeFetchId, '/episodes'],
    queryFn: async () => {
      if (!episodeFetchId) return [];
      
      console.log('Fetching episodes for show with ID:', episodeFetchId);
      
      // Use ID or sourceId depending on what's available
      const response = await apiRequest('GET', `/api/videos/tv/${episodeFetchId}/episodes`);
      const episodes = await response.json();

      // Process episodes to extract titles and store them in the cache
      if (currentShow) {
        const showTitle = currentShow.title || 'Unknown Show';
        const showId = currentShow.metadata?.imdbId || currentShow.sourceId;
        
        // Process each episode to extract and store titles and update their format
        const processedEpisodes = episodes.map((episode: Video) => {
          if (episode.metadata?.season && episode.metadata?.episode) {
            const season = episode.metadata.season;
            const episodeNum = episode.metadata.episode;
            
            // Extract episode title if it has one
            const titleParts = episode.title?.split(' - ');
            let episodeTitle = '';
            
            if (titleParts && titleParts.length > 1) {
              episodeTitle = titleParts[1];
              const cacheKey = getEpisodeKey(showId, season, episodeNum);
              episodeTitleCache.set(cacheKey, episodeTitle);
              console.log(`Cached episode title from API: ${cacheKey} = "${episodeTitle}"`);
            }
            
            // Check if generic title ("Season X, Episode Y")
            if (episode.title && episode.title.includes('Season') && episode.title.includes('Episode')) {
              // Format a consistent title
              const newTitle = formatEpisodeTitle(showTitle, season, episodeNum, episodeTitle);
              console.log(`Formatting API episode title: "${episode.title}" → "${newTitle}"`);
              
              // Return a new episode object with the updated title
              return {
                ...episode,
                title: newTitle
              };
            }
          }
          
          // Return the original episode if no changes needed
          return episode;
        });
        
        return processedEpisodes;
      }
      
      return episodes;
    },
    enabled: !!episodeFetchId && currentSource === 'vidsrc' && navigation.view === 'video'
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={handleWatchlistClick}
      />
      <main className="container mx-auto p-4 md:p-6">
        <div className="space-y-4">
          {navigation.view !== 'browse' && (
            <div className="flex items-center justify-between">
              <BackButton onClick={handleBack} />
              <h2 className="text-xl font-semibold">
                {navigation.view === 'search' && 'Search Results'}
                {navigation.view === 'watchlist' && 'Your Watchlist'}
                {navigation.view === 'video' && selectedVideo?.title}
              </h2>
            </div>
          )}

          {navigation.view === 'browse' && (
            <>
              <SourceSelector
                currentSource={currentSource}
                onSourceSelect={handleSourceSelect}
              />
              <SearchBar
                onSearch={handleSearch}
                placeholder={`Search ${currentSource === 'youtube' ? 'YouTube videos' : 'movies and TV shows'}...`}
              />
            </>
          )}
        </div>

        <div className="mt-6 grid gap-6 grid-cols-1">
          {selectedVideo ? (
            <div className="space-y-6">
              <VideoPlayer video={selectedVideo} />
              {currentSource === 'vidsrc' && (
                <ShowDetails
                  show={currentShow || (selectedVideo?.metadata?.type === 'tv' ? selectedVideo : undefined)}
                  episodes={showEpisodes}
                  onEpisodeSelect={handleVideoSelect}
                  currentEpisode={selectedVideo}
                />
              )}
            </div>
          ) : null}

          <div className="w-full">
            {navigation.view === 'watchlist' && isLoggedIn ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Watchlist</h2>
                </div>
                {!watchlist?.length ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your watchlist is empty. Browse videos and click the bookmark icon to add them to your watchlist.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <VideoList
                    videos={watchlist}
                    isLoading={false}
                    error={null}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                )}
              </>
            ) : searchQuery ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                <VideoList
                  videos={searchResults}
                  isLoading={searchLoading}
                  error={searchError}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </div>
            ) : currentSource === 'vidsrc' ? (
              <Tabs defaultValue="movies" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="movies">Movies</TabsTrigger>
                  <TabsTrigger value="shows">TV Shows</TabsTrigger>
                </TabsList>

                <TabsContent value="movies" className="w-full">
                  <VideoList
                    videos={movies}
                    isLoading={moviesLoading}
                    error={moviesError}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="shows" className="w-full">
                  <VideoList
                    videos={shows}
                    isLoading={showsLoading}
                    error={showsError}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                </TabsContent>
              </Tabs>
            ) : null}
          </div>
        </div>
      </main>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
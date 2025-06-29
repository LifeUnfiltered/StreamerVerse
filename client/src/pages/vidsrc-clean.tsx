import { useState, useCallback, useMemo, useEffect } from "react";
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
import ContinueWatching from "@/components/ContinueWatching";
import WatchHistory from "@/components/WatchHistory";
import { 
  AlertCircle, 
  Sword, 
  Plane, 
  Heart, 
  Laugh, 
  Ghost, 
  Rocket, 
  Film, 
  Tv, 
  Skull, 
  Music, 
  Castle, 
  Umbrella, 
  FlaskConical,
  Bomb,
  Baby,
  Users,
  Search,
  Camera,
  History,
  Zap
} from "lucide-react";
import BackButton from "@/components/BackButton";

// Cache objects for episode metadata
const showNameCache = new Map<string, string>();
const episodeTitleCache = new Map<string, string>();
const episodeDescriptionCache = new Map<string, string>();

// Helper functions for episode metadata
const getEpisodeKey = (showId: string, season: number, episode: number): string => {
  return `${showId}-s${season}e${episode}`;
};

const formatEpisodeTitle = (showTitle: string, season: number, episode: number, episodeTitle?: string): string => {
  const baseTitle = `${showTitle} S${season}E${episode}`;
  return episodeTitle ? `${baseTitle} - ${episodeTitle}` : baseTitle;
};

interface NavigationState {
  view: 'browse' | 'search' | 'watchlist' | 'video' | 'trending' | 'history';
  previousView: 'browse' | 'search' | 'watchlist' | 'video' | 'trending' | 'history' | null;
}

interface GenreItem {
  id: number;
  name: string;
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
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedGenreType, setSelectedGenreType] = useState<'movies' | 'tv'>('movies');
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

  // Fetch episodes for the selected TV show
  const shouldFetchEpisodes = selectedVideo?.metadata?.type === 'tv' && currentSource === 'vidsrc' && selectedVideo?.metadata?.imdbId;
  const { data: episodes = [], isLoading: episodesLoading } = useQuery<Video[]>({
    queryKey: ['episodes', selectedVideo?.metadata?.imdbId],
    queryFn: async () => {
      const imdbId = selectedVideo?.metadata?.imdbId;
      console.log('🎬 FETCHING EPISODES FOR:', imdbId);
      const response = await fetch(`/api/videos/tv/${imdbId}/episodes`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const data = await response.json();
      console.log('🎬 EPISODES FETCHED:', data.length, 'episodes');
      return data;
    },
    enabled: shouldFetchEpisodes,
    staleTime: 10 * 60 * 1000,
  });

  // Debug logging in useEffect to avoid JSX issues
  useEffect(() => {
    if (selectedVideo) {
      console.log('🎬 EPISODES DEBUG:', {
        selectedVideo: selectedVideo.title,
        videoType: selectedVideo?.metadata?.type,
        currentSource,
        imdbId: selectedVideo?.metadata?.imdbId,
        shouldFetchEpisodes,
        episodesLength: episodes.length,
        episodesLoading,
        showEpisodesCondition: currentSource === 'vidsrc' && selectedVideo?.metadata?.type === 'tv'
      });
    }
  }, [selectedVideo, episodes.length, currentSource, episodesLoading, shouldFetchEpisodes]);

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
      const shows = await response.json();
      
      // Cache the show titles for future reference
      shows.forEach((show: Video) => {
        if (show.metadata?.type === 'tv') {
          const showId = show.metadata?.imdbId || show.sourceId;
          if (showId && show.title) {
            showNameCache.set(showId, show.title);
            console.log(`Cached show title from browse: ${showId} = "${show.title}"`);
          }
        }
      });
      
      return shows;
    },
    enabled: !searchQuery && currentSource === 'vidsrc' && navigation.view === 'browse'
  });

  // YouTube trending content
  const { data: youtubeTrending, isLoading: youtubeTrendingLoading, error: youtubeTrendingError } = useQuery<Video[]>({
    queryKey: ['/api/videos/youtube/trending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/search?query=trending 2024&source=youtube');
      return response.json();
    },
    enabled: currentSource === 'youtube' && navigation.view === 'browse' && !searchQuery,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // YouTube category content
  const { data: youtubeRecommendations, isLoading: youtubeRecommendationsLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/youtube/recommendations'],
    queryFn: async () => {
      const categories = ['music 2024', 'tech review', 'cooking tutorial', 'gaming highlights'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const response = await apiRequest('GET', `/api/videos/search?query=${encodeURIComponent(randomCategory)}&source=youtube`);
      return response.json();
    },
    enabled: currentSource === 'youtube' && navigation.view === 'browse' && !searchQuery,
    staleTime: 10 * 60 * 1000 // Cache for 10 minutes
  });

  // Search query
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery<Video[]>({
    queryKey: [currentSource === 'youtube' ? '/api/videos/search' : '/api/videos/vidsrc/search', searchQuery, currentSource],
    queryFn: async () => {
      const endpoint = currentSource === 'youtube'
        ? `/api/videos/search?query=${encodeURIComponent(searchQuery)}&source=youtube`
        : `/api/videos/vidsrc/search?query=${encodeURIComponent(searchQuery)}`;
      const response = await apiRequest('GET', endpoint);
      const results = await response.json();
      
      return results;
    },
    enabled: searchQuery.length > 0
  });

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
    setSelectedVideo(null);
    
    setNavigation({ 
      view: 'search', 
      previousView: navigation.view === 'search' ? navigation.previousView : navigation.view 
    });
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
  
  const handleTrendingClick = () => {
    setNavigation({ 
      view: 'trending',
      previousView: navigation.view === 'trending' ? navigation.previousView : navigation.view
    });
    setSearchQuery('');
    setSelectedVideo(null);
  };
  
  const handleHistoryClick = () => {
    setNavigation({ 
      view: 'history',
      previousView: navigation.view === 'history' ? navigation.previousView : navigation.view
    });
    setSearchQuery('');
    setSelectedVideo(null);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setNavigation({ 
      view: 'video',
      previousView: navigation.view === 'video' ? navigation.previousView : navigation.view
    });
  };

  const isLoggedIn = !!watchlist;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={handleWatchlistClick}
        onTrendingClick={handleTrendingClick}
        onHistoryClick={handleHistoryClick}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {navigation.view !== 'browse' && (
                <BackButton 
                  onClick={() => setNavigation({ 
                    view: navigation.previousView || 'browse', 
                    previousView: null 
                  })}
                />
              )}
              <SearchBar onSearch={handleSearch} />
            </div>
            <SourceSelector 
              onSourceSelect={handleSourceSelect}
              currentSource={currentSource}
            />
          </div>

          <div className="mt-6 grid gap-6 grid-cols-1">
            {selectedVideo ? (
              <div className="space-y-6">
                <VideoPlayer video={selectedVideo} />
{/* Debug condition check */}
                {currentSource === 'vidsrc' && selectedVideo?.metadata?.type === 'tv' && (
                  <ShowDetails
                    show={selectedVideo}
                    episodes={episodes}
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
              ) : navigation.view === 'history' && isLoggedIn ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Your Watch History</h2>
                  </div>
                  <WatchHistory
                    onSelect={handleVideoSelect}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
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
                <div className="space-y-10">
                  {/* Continue Watching section for VidSrc */}
                  <ContinueWatching 
                    onSelect={handleVideoSelect}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />

                  {/* VidSrc Premium Header */}
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        🎬 Premium Movies & TV Shows
                      </h2>
                      <p className="text-muted-foreground">Stream high-quality content from our extensive collection</p>
                    </div>
                  </div>

                  <Tabs defaultValue="movies" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gradient-to-r from-background to-muted/20 border-2 border-primary/20">
                      <TabsTrigger value="movies" className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                        🎬 Movies
                      </TabsTrigger>
                      <TabsTrigger value="shows" className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                        📺 TV Shows
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="movies" className="w-full space-y-8">
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            🍿 Latest Movies
                          </h3>
                          <p className="text-muted-foreground">Discover the newest movie releases</p>
                        </div>
                        <VideoList
                          videos={movies}
                          isLoading={moviesLoading}
                          error={moviesError}
                          onVideoSelect={handleVideoSelect}
                          selectedVideo={selectedVideo}
                          onAuthRequired={() => setIsAuthDialogOpen(true)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="shows" className="w-full space-y-8">
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                            📺 Popular TV Shows
                          </h3>
                          <p className="text-muted-foreground">Discover trending TV series and shows</p>
                        </div>
                        <VideoList
                          videos={shows}
                          isLoading={showsLoading}
                          error={showsError}
                          onVideoSelect={handleVideoSelect}
                          selectedVideo={selectedVideo}
                          onAuthRequired={() => setIsAuthDialogOpen(true)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : currentSource === 'youtube' ? (
                <div className="space-y-10">
                  {/* Continue Watching section for YouTube */}
                  <ContinueWatching 
                    onSelect={handleVideoSelect}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />

                  {/* YouTube Categories */}
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        YouTube Categories
                      </h2>
                      <p className="text-muted-foreground">Discover content across all your favorite categories</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {[
                        { name: 'Music', query: 'music', icon: <Music className="h-7 w-7" />, gradient: 'from-pink-500 to-red-500' },
                        { name: 'Gaming', query: 'gaming', icon: <Zap className="h-7 w-7" />, gradient: 'from-purple-500 to-indigo-500' },
                        { name: 'Comedy', query: 'comedy', icon: <Laugh className="h-7 w-7" />, gradient: 'from-yellow-500 to-orange-500' },
                        { name: 'Tech', query: 'technology', icon: <Rocket className="h-7 w-7" />, gradient: 'from-blue-500 to-cyan-500' },
                        { name: 'Education', query: 'education', icon: <FlaskConical className="h-7 w-7" />, gradient: 'from-green-500 to-emerald-500' },
                        { name: 'Sports', query: 'sports', icon: <Users className="h-7 w-7" />, gradient: 'from-orange-500 to-red-500' },
                        { name: 'News', query: 'news', icon: <Camera className="h-7 w-7" />, gradient: 'from-gray-500 to-slate-600' },
                        { name: 'Travel', query: 'travel', icon: <Plane className="h-7 w-7" />, gradient: 'from-teal-500 to-blue-500' },
                        { name: 'Food', query: 'cooking food', icon: <Heart className="h-7 w-7" />, gradient: 'from-rose-500 to-pink-500' },
                        { name: 'DIY', query: 'diy tutorial', icon: <Castle className="h-7 w-7" />, gradient: 'from-amber-500 to-yellow-500' },
                        { name: 'Fitness', query: 'fitness workout', icon: <Sword className="h-7 w-7" />, gradient: 'from-red-500 to-orange-500' },
                        { name: 'Movies', query: 'movie trailers', icon: <Film className="h-7 w-7" />, gradient: 'from-indigo-500 to-purple-500' }
                      ].map(category => (
                        <button
                          key={category.name}
                          onClick={() => handleSearch(category.query)}
                          className="group relative p-6 rounded-2xl bg-gradient-to-br from-background to-muted border border-border hover:border-primary/50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className={`p-3 rounded-full bg-gradient-to-br ${category.gradient}`}>
                              <div className="text-white">
                                {category.icon}
                              </div>
                            </div>
                            <span className="font-medium text-center text-foreground group-hover:text-primary">
                              {category.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* YouTube Trending Content */}
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        🔥 Trending on YouTube
                      </h2>
                      <p className="text-muted-foreground">What's hot right now</p>
                    </div>
                    <VideoList
                      videos={youtubeTrending}
                      isLoading={youtubeTrendingLoading}
                      error={youtubeTrendingError}
                      onVideoSelect={handleVideoSelect}
                      selectedVideo={selectedVideo}
                      onAuthRequired={() => setIsAuthDialogOpen(true)}
                    />
                  </div>

                  {/* YouTube Recommendations */}
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold">✨ Recommended for You</h2>
                      <p className="text-muted-foreground">Personalized picks based on trending categories</p>
                    </div>
                    <VideoList
                      videos={youtubeRecommendations}
                      isLoading={youtubeRecommendationsLoading}
                      error={null}
                      onVideoSelect={handleVideoSelect}
                      selectedVideo={selectedVideo}
                      onAuthRequired={() => setIsAuthDialogOpen(true)}
                    />
                  </div>
                </div>
              ) : null}
            </div>
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
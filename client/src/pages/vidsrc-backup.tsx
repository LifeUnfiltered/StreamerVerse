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
        onWatchlistClick={() => setNavigation({ view: 'watchlist', previousView: navigation.view })}
        onTrendingClick={() => setNavigation({ view: 'trending', previousView: navigation.view })}
        onHistoryClick={() => setNavigation({ view: 'history', previousView: navigation.view })}
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
              </div>
            ) : null}

            <div className="w-full">
              {navigation.view === 'search' && searchQuery ? (
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
                  <ContinueWatching 
                    onSelect={handleVideoSelect}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />

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
                  <ContinueWatching 
                    onSelect={handleVideoSelect}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />

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
                        { name: 'Sports', query: 'sports', icon: <Users className="h-7 w-7" />, gradient: 'from-orange-500 to-red-500' }
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
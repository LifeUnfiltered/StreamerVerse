import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSource, setCurrentSource] = useState<'youtube' | 'vidsrc'>('vidsrc');
  const [showWatchlist, setShowWatchlist] = useState(false);
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
    enabled: !searchQuery && currentSource === 'vidsrc'
  });

  const { data: shows, isLoading: showsLoading, error: showsError } = useQuery<Video[]>({
    queryKey: ['/api/videos/test-tv'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/test-tv');
      return response.json();
    },
    enabled: !searchQuery && currentSource === 'vidsrc'
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

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
    setShowWatchlist(false);
  };

  const handleSourceSelect = (source: 'youtube' | 'vidsrc') => {
    setCurrentSource(source);
    setSelectedVideo(null);
    setSearchQuery('');
    setShowWatchlist(false);
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
  };

  const handleWatchlistClick = () => {
    setSearchQuery('');
    setShowWatchlist(true);
  };

  const isLoggedIn = watchlist !== null;

  // Get current show and its episodes
  const currentShow = selectedVideo && shows?.find(show =>
    show.sourceId === selectedVideo.sourceId || // For direct show selection
    show.sourceId === selectedVideo.metadata?.imdbId // For episode selection
  );

  const showEpisodes = episodes?.filter(episode =>
    episode.metadata?.imdbId === currentShow?.metadata?.imdbId
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={handleWatchlistClick}
      />
      <main className="container mx-auto p-4 md:p-6">
        <div className="space-y-4">
          <SourceSelector
            currentSource={currentSource}
            onSourceSelect={handleSourceSelect}
          />
          <SearchBar
            onSearch={handleSearch}
            placeholder={`Search ${currentSource === 'youtube' ? 'YouTube videos' : 'movies and TV shows'}...`}
          />
        </div>

        <div className="mt-6 grid gap-6 grid-cols-1">
          {selectedVideo ? (
            <div className="space-y-6">
              <VideoPlayer video={selectedVideo} />
              {currentShow && currentSource === 'vidsrc' && (
                <ShowDetails
                  show={currentShow}
                  episodes={showEpisodes}
                  onEpisodeSelect={handleVideoSelect}
                  currentEpisode={selectedVideo}
                />
              )}
            </div>
          ) : null}

          <div className="w-full">
            {showWatchlist && !searchQuery && isLoggedIn ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Watchlist</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowWatchlist(false)}
                  >
                    ← Back to Browse
                  </Button>
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
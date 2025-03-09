import { useState } from "react";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthDialog from "@/components/AuthDialog";
import SearchBar from "@/components/SearchBar";
import ShowDetails from "@/components/ShowDetails";
import SourceSelector from "@/components/SourceSelector";

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSource, setCurrentSource] = useState<'youtube' | 'vidsrc'>('vidsrc');

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
    setPage(1);
    setSelectedVideo(null);
  };

  const handleSourceSelect = (source: 'youtube' | 'vidsrc') => {
    setCurrentSource(source);
    setSelectedVideo(null);
    setSearchQuery('');
  };

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
        onWatchlistClick={() => {}}
      />
      <main className="container mx-auto px-4 py-6">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
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

          <ScrollArea className="h-[calc(100vh-200px)] lg:col-span-1">
            {searchQuery ? (
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="movies">Movies</TabsTrigger>
                  <TabsTrigger value="shows">TV Shows</TabsTrigger>
                </TabsList>

                <TabsContent value="movies">
                  <VideoList 
                    videos={movies}
                    isLoading={moviesLoading}
                    error={moviesError}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="shows">
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
          </ScrollArea>
        </div>
      </main>

      <AuthDialog 
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
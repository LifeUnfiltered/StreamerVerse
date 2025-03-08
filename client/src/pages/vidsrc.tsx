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

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Latest content queries
  const { data: movies, isLoading: moviesLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/movies', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/movies?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery
  });

  const { data: shows, isLoading: showsLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/test-tv'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/test-tv');
      const video = await response.json();
      return [video];
    },
    enabled: !searchQuery
  });

  const { data: episodes } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/episodes', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/episodes?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery && !!selectedVideo
  });

  // Search query
  const { data: searchResults, isLoading: searchLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/search', searchQuery],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/search?query=${encodeURIComponent(searchQuery)}`);
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

  // Get current show and its episodes
  const currentShow = selectedVideo ? shows?.find(show => 
    show.sourceId === selectedVideo.metadata?.imdbId
  ) : null;

  const showEpisodes = episodes?.filter(episode => 
    episode.sourceId === selectedVideo?.sourceId
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={() => {}}
      />
      <main className="container mx-auto px-4 py-6">
        <SearchBar 
          onSearch={handleSearch}
          defaultValue={searchQuery}
          placeholder="Search movies and TV shows..."
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          {selectedVideo ? (
            <div className="space-y-6">
              <VideoPlayer video={selectedVideo} />
              {currentShow && (
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
                  error={null}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </div>
            ) : (
              <Tabs defaultValue="movies" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="movies">Movies</TabsTrigger>
                  <TabsTrigger value="shows">TV Shows</TabsTrigger>
                </TabsList>

                <TabsContent value="movies">
                  <VideoList 
                    videos={movies}
                    isLoading={moviesLoading}
                    error={null}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="shows">
                  <VideoList 
                    videos={shows}
                    isLoading={showsLoading}
                    error={null}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                </TabsContent>
              </Tabs>
            )}
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
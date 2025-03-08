import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoList from "@/components/VideoList";
import VideoPlayer from "@/components/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import AuthDialog from "@/components/AuthDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: ['/api/videos/search', searchQuery],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/search?query=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.length > 0
  });

  const { data: watchlist } = useQuery<Video[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/watchlist');
        return response.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          return [];
        }
        throw error;
      }
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
    setShowWatchlist(false);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
  };

  const handleWatchlistClick = () => {
    setSearchQuery('');
    setShowWatchlist(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthClick={() => setIsAuthDialogOpen(true)} 
        onWatchlistClick={handleWatchlistClick}
      />
      <main className="container mx-auto px-4 py-6">
        <SearchBar onSearch={handleSearch} />

        {showWatchlist && !searchQuery && (
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Watchlist</h2>
            <Button 
              variant="ghost" 
              onClick={() => setShowWatchlist(false)}
              className="text-muted-foreground"
            >
              ← Back to Search
            </Button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          {selectedVideo ? (
            <div className="order-first lg:col-span-1">
              <VideoPlayer video={selectedVideo} />
            </div>
          ) : null}

          <ScrollArea className="h-[calc(100vh-200px)] lg:col-span-1">
            {!searchQuery && !watchlist?.length && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your watchlist is empty. Search for videos and click the bookmark icon to add them to your watchlist.
                  {watchlist === null && " Please log in to use the watchlist feature."}
                </AlertDescription>
              </Alert>
            )}

            {((showWatchlist && !searchQuery) || watchlist?.length === 0) && watchlist && (
              <VideoList 
                videos={watchlist}
                isLoading={false}
                error={null}
                onVideoSelect={handleVideoSelect}
                selectedVideo={selectedVideo}
                onAuthRequired={() => setIsAuthDialogOpen(true)}
              />
            )}

            {searchQuery && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                {watchlist && watchlist.length > 0 && (
                  <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Quick Access - Your Watchlist</h3>
                    <VideoList 
                      videos={watchlist}
                      isLoading={false}
                      error={null}
                      onVideoSelect={handleVideoSelect}
                      selectedVideo={selectedVideo}
                      onAuthRequired={() => setIsAuthDialogOpen(true)}
                    />
                  </div>
                )}
                <VideoList 
                  videos={videos}
                  isLoading={isLoading}
                  error={error as Error}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </div>
            )}
          </ScrollArea>
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
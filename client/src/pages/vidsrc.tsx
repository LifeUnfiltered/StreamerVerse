import { useState } from "react";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: movies, isLoading: moviesLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/movies', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/movies?page=${page}`);
      return response.json();
    }
  });

  const { data: shows, isLoading: showsLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/shows', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/shows?page=${page}`);
      return response.json();
    }
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/episodes', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/episodes?page=${page}`);
      return response.json();
    }
  });

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={() => {}}
      />
      <main className="container mx-auto px-4 py-6">
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          {selectedVideo ? (
            <div className="space-y-6">
              <VideoPlayer video={selectedVideo} />
            </div>
          ) : null}

          <ScrollArea className="h-[calc(100vh-200px)] lg:col-span-1">
            <Tabs defaultValue="movies" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="shows">TV Shows</TabsTrigger>
                <TabsTrigger value="episodes">Latest Episodes</TabsTrigger>
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

              <TabsContent value="episodes">
                <VideoList 
                  videos={episodes}
                  isLoading={episodesLoading}
                  error={null}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
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
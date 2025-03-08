import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoList from "@/components/VideoList";
import VideoPlayer from "@/components/VideoPlayer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { Video } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos/search', searchQuery],
    enabled: searchQuery.length > 0
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <SearchBar onSearch={handleSearch} />
        
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          {selectedVideo ? (
            <div className="order-first lg:col-span-1">
              <VideoPlayer video={selectedVideo} />
            </div>
          ) : null}
          
          <ScrollArea className="h-[calc(100vh-200px)] lg:col-span-1">
            <VideoList 
              videos={videos}
              isLoading={isLoading}
              error={error}
              onVideoSelect={handleVideoSelect}
              selectedVideo={selectedVideo}
            />
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}

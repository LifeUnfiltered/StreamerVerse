import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";

interface ContinueWatchingProps {
  onSelect: (video: Video) => void;
  onAuthRequired: () => void;
}

interface VideoWithProgress extends Video {
  lastPosition?: number;
  duration?: number;
  watchedAt?: string;
}

export default function ContinueWatching({ onSelect, onAuthRequired }: ContinueWatchingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const maxItems = isExpanded ? 20 : (isMobile ? 2 : 4);
  
  const { data: videos, isLoading, error } = useQuery<VideoWithProgress[]>({
    queryKey: ['/api/continue-watching'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/continue-watching?limit=${maxItems}`);
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch continue watching list');
        }
        return response.json();
      } catch (error) {
        console.error('Continue watching error:', error);
        throw error;
      }
    },
    retry: false
  });

  const handleVideoClick = (video: Video) => {
    onSelect(video);
  };

  // Show nothing if there's no data to display
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Continue Watching</h2>
        {videos && videos.length > (isMobile ? 2 : 4) && (
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {videos?.slice(0, maxItems).map((video) => {
            // Calculate progress percentage
            const progress = video.duration && video.lastPosition 
              ? Math.min(Math.round((video.lastPosition / video.duration) * 100), 100)
              : 0;
            
            // Format the time since watched
            const timeAgo = video.watchedAt 
              ? formatDistanceToNow(new Date(video.watchedAt), { addSuffix: true })
              : '';
            
            return (
              <Card 
                key={video.sourceId} 
                className="w-[220px] min-w-[220px] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <span className="text-muted-foreground">No thumbnail</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={progress} className="h-1 rounded-none bg-background/30" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                      <Button size="sm" variant="secondary" className="rounded-full p-2 h-10 w-10">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium truncate mb-1">{video.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{timeAgo}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
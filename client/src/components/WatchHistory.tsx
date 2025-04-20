import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Calendar, Film, Tv } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow, format } from "date-fns";

interface WatchHistoryProps {
  onSelect: (video: Video) => void;
  onAuthRequired: () => void;
}

interface VideoWithTimestamp extends Video {
  watchedAt?: string | Date;
}

export default function WatchHistory({ onSelect, onAuthRequired }: WatchHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const limit = isExpanded ? 30 : (isMobile ? 4 : 12);
  
  const { data: videos, isLoading, error } = useQuery<VideoWithTimestamp[]>({
    queryKey: ['/api/watch-history', limit],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/watch-history?limit=${limit}`);
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch watch history');
        }
        return response.json();
      } catch (error) {
        console.error('Watch history error:', error);
        throw error;
      }
    },
    retry: false
  });

  // Show nothing if there's no data to display
  if (!videos || videos.length === 0) {
    return null;
  }

  // Group videos by day
  const groupedVideos: Record<string, VideoWithTimestamp[]> = {};
  
  videos.forEach(video => {
    if (video.watchedAt) {
      const date = new Date(video.watchedAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groupedVideos[dateKey]) {
        groupedVideos[dateKey] = [];
      }
      
      groupedVideos[dateKey].push(video);
    }
  });

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="mr-2 h-6 w-6" />
          <h2 className="text-2xl font-semibold">Watch History</h2>
        </div>
        {videos && videos.length > (isMobile ? 4 : 12) && (
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>
      
      <div className="space-y-8">
        {Object.entries(groupedVideos).map(([dateKey, dayVideos]) => {
          const date = new Date(dateKey);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
          const isYesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') === dateKey;
          
          let dateLabel = format(date, 'MMMM d, yyyy');
          if (isToday) dateLabel = 'Today';
          if (isYesterday) dateLabel = 'Yesterday';
          
          return (
            <div key={dateKey} className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">{dateLabel}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dayVideos.map(video => (
                  <Card 
                    key={`${video.sourceId}-${video.watchedAt}`} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelect(video)}
                  >
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
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium line-clamp-2">{video.title}</h4>
                      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          {video.metadata?.type === 'movie' ? (
                            <Film className="h-3 w-3 mr-1" />
                          ) : (
                            <Tv className="h-3 w-3 mr-1" />
                          )}
                          <span>
                            {video.metadata?.type === 'movie' ? 'Movie' : 'TV Show'}
                          </span>
                        </div>
                        {video.watchedAt && (
                          <span className="text-xs">
                            {isToday ? format(new Date(video.watchedAt), 'h:mm a') : ''}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {videos && videos.length > 12 && !isExpanded && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(true)}
          >
            View All History
          </Button>
        </div>
      )}
    </div>
  );
}
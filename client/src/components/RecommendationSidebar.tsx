import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Video } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoCard from "./VideoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationSidebarProps {
  currentVideo: Video;
  onVideoSelect: (video: Video) => void;
  onAuthRequired: () => void;
}

export default function RecommendationSidebar({
  currentVideo,
  onVideoSelect,
  onAuthRequired
}: RecommendationSidebarProps) {
  const { data: recommendations, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/recommendations', currentVideo.sourceId],
    queryFn: async () => {
      const res = await apiRequest(
        'GET', 
        `/api/videos/recommendations?videoId=${currentVideo.sourceId}`
      );
      return res.json();
    },
    enabled: !!currentVideo.sourceId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Videos</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {recommendations.map((video) => (
              <VideoCard
                key={video.sourceId}
                video={video}
                onClick={() => onVideoSelect(video)}
                isSelected={false}
                onAuthRequired={onAuthRequired}
                variant="compact"
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
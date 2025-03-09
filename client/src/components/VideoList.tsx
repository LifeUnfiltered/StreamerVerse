import type { Video } from "@shared/schema";
import VideoCard from "./VideoCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoListProps {
  videos?: Video[];
  isLoading: boolean;
  error: Error | null;
  onVideoSelect: (video: Video) => void;
  selectedVideo: Video | null;
  onAuthRequired: () => void;
}

export default function VideoList({
  videos,
  isLoading,
  error,
  onVideoSelect,
  selectedVideo,
  onAuthRequired
}: VideoListProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={`skeleton-${i}`} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <Alert>
        <AlertDescription>
          No videos found. Try searching for something else.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={`${video.source}-${video.sourceId}`}
          video={video}
          onClick={() => onVideoSelect(video)}
          isSelected={selectedVideo?.sourceId === video.sourceId}
          onAuthRequired={onAuthRequired}
        />
      ))}
    </div>
  );
}
import type { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import WatchlistButton from "./WatchlistButton";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isSelected: boolean;
  onAuthRequired: () => void;
}

export default function VideoCard({ 
  video, 
  onClick, 
  isSelected,
  onAuthRequired 
}: VideoCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "border-primary"
      )}
    >
      <CardContent className="p-3">
        <div className="aspect-video relative overflow-hidden rounded-md">
          <img 
            src={video.thumbnail || ''} 
            alt={video.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 right-2">
            <WatchlistButton 
              video={video} 
              onAuthRequired={onAuthRequired}
            />
          </div>
        </div>
        <div 
          className="mt-3"
          onClick={onClick}
        >
          <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {video.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
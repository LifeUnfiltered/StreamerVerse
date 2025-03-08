import type { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isSelected: boolean;
}

export default function VideoCard({ video, onClick, isSelected }: VideoCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "border-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="aspect-video relative overflow-hidden rounded-md">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="mt-3">
          <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {video.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

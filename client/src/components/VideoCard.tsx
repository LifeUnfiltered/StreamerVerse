import type { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import WatchlistButton from "./WatchlistButton";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isSelected: boolean;
  onAuthRequired: () => void;
  variant?: 'default' | 'compact';
}

export default function VideoCard({ 
  video, 
  onClick, 
  isSelected,
  onAuthRequired,
  variant = 'default'
}: VideoCardProps) {
  const isCompact = variant === 'compact';

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "border-primary",
        isCompact && "border-0 shadow-none"
      )}
    >
      <CardContent className={cn("p-3", isCompact && "p-2")}>
        <div 
          className="grid gap-3"
          style={{
            gridTemplateColumns: isCompact ? '120px 1fr' : '1fr',
          }}
        >
          <div 
            className={cn(
              "relative overflow-hidden rounded-md",
              isCompact ? "aspect-video" : "aspect-video w-full"
            )}
            onClick={onClick}
          >
            <img 
              src={video.thumbnail || ''} 
              alt={video.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2" onClick={e => e.stopPropagation()}>
              <WatchlistButton 
                video={video} 
                onAuthRequired={onAuthRequired}
              />
            </div>
          </div>
          <div 
            className="cursor-pointer"
            onClick={onClick}
          >
            <h3 className={cn(
              "font-semibold",
              isCompact ? "text-sm line-clamp-2" : "line-clamp-2"
            )}>
              {video.title}
            </h3>
            {!isCompact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
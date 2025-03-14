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
        "cursor-pointer transition-all duration-300 ease-in-out",
        "hover:scale-[1.02] hover:shadow-lg",
        "hover:bg-accent/80 active:scale-[0.98]",
        "transform-gpu backface-hidden",
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
              "relative overflow-hidden rounded-md group",
              "transition-transform duration-300 ease-in-out",
              isCompact ? "aspect-video" : "aspect-video w-full"
            )}
            onClick={onClick}
          >
            <img 
              src={video.thumbnail || ''} 
              alt={video.title}
              className={cn(
                "object-cover w-full h-full",
                "transition-transform duration-300 group-hover:scale-105"
              )}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                 onClick={e => e.stopPropagation()}>
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
              "font-semibold transition-colors duration-300",
              isCompact ? "text-sm line-clamp-2" : "line-clamp-2"
            )}>
              {video.title}
            </h3>
            {!isCompact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 transition-colors duration-300">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
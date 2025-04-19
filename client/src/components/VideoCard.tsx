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
            
            {/* For compact view, show badges in a single row */}
            {isCompact && (
              <div className="flex flex-wrap gap-1 mt-1">
                {video.metadata?.contentRating && (
                  <span className="inline-flex items-center rounded-sm bg-secondary/50 px-1.5 py-0.5 text-[10px] font-medium">
                    {video.metadata.contentRating}
                  </span>
                )}
                {video.metadata?.runtime && (
                  <span className="inline-flex items-center rounded-sm bg-secondary/50 px-1.5 py-0.5 text-[10px] font-medium">
                    {video.metadata.runtime}m
                  </span>
                )}
                {video.metadata?.voteAverage && (
                  <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {video.metadata.voteAverage.toFixed(1)}★
                  </span>
                )}
              </div>
            )}
            
            {!isCompact && (
              <>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 transition-colors duration-300">
                  {video.description}
                </p>
                
                {/* Display metadata badges (Content Rating, Runtime) */}
                <div className="flex gap-2 mt-1.5 mb-1">
                  {video.metadata?.contentRating && (
                    <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium">
                      {video.metadata.contentRating}
                    </span>
                  )}
                  {video.metadata?.runtime && (
                    <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium">
                      {video.metadata.runtime} min
                    </span>
                  )}
                  {video.metadata?.voteAverage && (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {video.metadata.voteAverage.toFixed(1)}★
                    </span>
                  )}
                </div>
                
                {/* Display release date for movies */}
                {video.metadata?.type === 'movie' && video.metadata.releaseDate && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    Released: {new Date(video.metadata.releaseDate).toLocaleDateString()}
                  </p>
                )}
                {/* Display first air date for TV shows */}
                {video.metadata?.type === 'tv' && video.metadata.firstAirDate && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    First aired: {new Date(video.metadata.firstAirDate).toLocaleDateString()}
                  </p>
                )}
                {/* Display air date for TV episodes */}
                {video.metadata?.type === 'tv' && video.metadata.airDate && 
                 video.metadata.season && video.metadata.episode && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    Aired: {new Date(video.metadata.airDate).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
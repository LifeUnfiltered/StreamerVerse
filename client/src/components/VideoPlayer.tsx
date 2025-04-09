import { useState, useEffect, useRef } from 'react';
import type { Video } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FloatingActionButton from "./FloatingActionButton";
import LoadingSpinner from "./LoadingSpinner";
import { AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe load
  useEffect(() => {
    if (video.source === 'vidsrc' && iframeRef.current) {
      const handleIframeLoad = () => {
        setIsLoading(false);
        // Ad blocking is now handled globally in index.html
      };

      // Attach load event
      const iframe = iframeRef.current;
      iframe.addEventListener('load', handleIframeLoad);
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
      };
    }
  }, [video.source, video.sourceId]);

  // Generate the embed URL based on the source and video type
  let embedUrl = '';
  
  if (video.source === 'youtube') {
    embedUrl = `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`;
  } else if (video.source === 'vidsrc') {
    // Check if it's a movie or TV show episode
    if (video.metadata?.type === 'movie') {
      // Use the new API format from documentation
      embedUrl = `https://vidsrc.xyz/embed/movie?imdb=${video.metadata.imdbId || video.sourceId}`;
    } else if (video.metadata?.type === 'tv') {
      // For TV shows, check if it has season and episode info
      if (video.metadata.season && video.metadata.episode) {
        embedUrl = `https://vidsrc.xyz/embed/tv?imdb=${video.metadata.imdbId || video.sourceId}&season=${video.metadata.season}&episode=${video.metadata.episode}`;
      } else {
        // Default to season 1, episode 1 if not specified
        embedUrl = `https://vidsrc.xyz/embed/tv?imdb=${video.metadata.imdbId || video.sourceId}&season=1&episode=1`;
      }
    } else if (video.metadata?.embedUrl) {
      // Fallback to the embedUrl if provided directly
      embedUrl = video.metadata.embedUrl;
    }
  }
    
  console.log('Video metadata:', video.metadata);
  console.log('Generated embed URL:', embedUrl);

  if (!embedUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="line-clamp-1">{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Video URL not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="line-clamp-1">{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AspectRatio ratio={16 / 9} className="relative bg-black rounded-md overflow-hidden video-player">
              <iframe
                ref={iframeRef}
                key={video.sourceId}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                className="absolute inset-0 w-full h-full video-player"
                id="video-player-iframe"
                onLoad={() => video.source === 'youtube' && setIsLoading(false)}
              />
              <AnimatePresence>
                {isLoading && <LoadingSpinner />}
              </AnimatePresence>
            </AspectRatio>
            <p className="text-sm text-muted-foreground">
              {video.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <FloatingActionButton video={video} />
    </div>
  );
}
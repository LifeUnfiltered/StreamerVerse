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
  const [attempt, setAttempt] = useState(0);

  // Get the embed URL based on the source - don't modify the original URL
  const embedUrl = video.source === 'youtube'
    ? `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`
    : video.metadata?.embedUrl || '';

  // Handle iframe load and cleanup
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const iframe = iframeRef.current;
    iframe.addEventListener('load', handleIframeLoad);
    
    // Set a timeout to retry loading if it takes too long
    const timeout = setTimeout(() => {
      if (isLoading && video.source === 'vidsrc') {
        setAttempt(prev => prev + 1);
      }
    }, 8000);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      clearTimeout(timeout);
    };
  }, [video.source, video.sourceId, isLoading, attempt]);

  // Gentle ad blocking without breaking functionality
  useEffect(() => {
    const adCleanupInterval = setInterval(() => {
      // Clean up only obvious ad elements without being too aggressive
      // Using as HTMLIFrameElement to ensure we have access to src property
      const adIframes = document.querySelectorAll<HTMLIFrameElement>('iframe[src*="ads"], iframe[src*="ad."], iframe[src*="pop"]');
      const popupDivs = document.querySelectorAll('div[id*="pop-"], div[id*="adb-"]');
      
      adIframes.forEach(el => {
        if (el.parentNode && !el.src.includes(video.sourceId)) {
          el.parentNode.removeChild(el);
        }
      });
      
      popupDivs.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }, 500);

    return () => {
      clearInterval(adCleanupInterval);
    };
  }, [video.sourceId]);

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
            <AspectRatio ratio={16 / 9} className="relative bg-black rounded-md overflow-hidden">
              <iframe
                ref={iframeRef}
                key={`${video.sourceId}-${attempt}`}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full z-10"
                onLoad={() => video.source === 'youtube' && setIsLoading(false)}
              />
              <AnimatePresence>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/50">
                    <LoadingSpinner />
                  </div>
                )}
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
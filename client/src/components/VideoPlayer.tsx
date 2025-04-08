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
  const timerRef = useRef<number | null>(null);

  // Special embed URL handling for VidSrc
  const rawEmbedUrl = video.source === 'youtube'
    ? `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`
    : video.metadata?.embedUrl || '';
    
  // Modify embed URL for VidSrc to block ads
  const embedUrl = video.source === 'vidsrc'
    ? `${rawEmbedUrl}#block-popups=true`
    : rawEmbedUrl;

  // Handle iframe load/cleanup and ad blocking
  useEffect(() => {
    if (video.source === 'vidsrc' && iframeRef.current) {
      // Handle iframe load
      const handleIframeLoad = () => {
        setIsLoading(false);
        
        // Start the ad blocking timer
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        
        // Set an interval to remove dynamically added ad elements
        timerRef.current = window.setInterval(() => {
          // Find all popup/modal overlays at the document level (not in iframe due to security)
          const popupOverlays = document.querySelectorAll('div[style*="z-index:"][style*="position: fixed"]');
          const adIframes = document.querySelectorAll('iframe:not([src*="youtube"]):not([src*="vidsrc"])');
          
          // Remove them
          popupOverlays.forEach(el => el.parentNode?.removeChild(el));
          adIframes.forEach(el => el.parentNode?.removeChild(el));
        }, 100);
      };

      // Add load event listener to iframe
      const iframe = iframeRef.current;
      iframe.addEventListener('load', handleIframeLoad);
      
      return () => {
        // Cleanup
        iframe.removeEventListener('load', handleIframeLoad);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [video.source, video.sourceId]);

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
                key={video.sourceId}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
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
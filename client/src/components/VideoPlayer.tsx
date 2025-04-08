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

  // Handle loading and popup blocking for VidSrc
  useEffect(() => {
    // Override window.open to block popups
    const originalWindowOpen = window.open;
    window.open = function() {
      console.log('Popup blocked:', arguments[0]);
      return null;
    };

    // Clean up on unmount
    return () => {
      window.open = originalWindowOpen;
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Handle iframe load
  useEffect(() => {
    if (video.source === 'vidsrc' && iframeRef.current) {
      const handleIframeLoad = () => {
        setIsLoading(false);
        
        // Setup interval to remove popup ads
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        
        timerRef.current = window.setInterval(() => {
          try {
            // Remove fixed position elements with high z-index (likely popups/ads)
            const popups = document.querySelectorAll('div[style*="position: fixed"][style*="z-index"]');
            popups.forEach(el => {
              const style = window.getComputedStyle(el);
              const zIndex = parseInt(style.zIndex);
              
              // Only remove elements that appear to be popups
              if (zIndex > 999 && el.parentNode) {
                console.log('Removing popup:', el);
                el.parentNode.removeChild(el);
              }
            });
            
            // Remove ad iframes
            const adIframes = document.querySelectorAll('iframe[src*="ads"], iframe[src*="pop"]');
            adIframes.forEach(el => {
              if (el.parentNode) {
                console.log('Removing ad iframe:', el);
                el.parentNode.removeChild(el);
              }
            });
          } catch (e) {
            // Silently ignore errors
          }
        }, 500);
      };

      // Attach load event
      const iframe = iframeRef.current;
      iframe.addEventListener('load', handleIframeLoad);
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [video.source, video.sourceId]);

  // Get the embed URL based on the source
  const embedUrl = video.source === 'youtube'
    ? `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`
    : video.metadata?.embedUrl || '';

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
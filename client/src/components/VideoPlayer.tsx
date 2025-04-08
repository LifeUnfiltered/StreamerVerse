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
  const adCleanupIntervalRef = useRef<number | null>(null);

  // Simple ad blocking and loading handling for VidSrc
  useEffect(() => {
    if (video.source === 'vidsrc') {
      // Set up event handler
      const handleIframeLoad = () => {
        setIsLoading(false);
        
        // Start ad-blocking interval
        if (adCleanupIntervalRef.current) {
          window.clearInterval(adCleanupIntervalRef.current);
        }
        
        // Simple ad-blocker that cleans ads but doesn't interfere with player 
        adCleanupIntervalRef.current = window.setInterval(() => {
          // Remove common VidSrc ads
          const adSelectors = [
            'div[class*="adi"]', 
            'iframe[src*="ads"]',
            'div[id*="AdDisplay"]', 
            'div[class*="opads"]',
            'div[class*="anchorads"]',
            'iframe:not([src*="vidsrc"]):not([src*="youtube"])'
          ];
          
          // Use document.querySelector to avoid errors when elements don't exist
          adSelectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                }
              });
            } catch (e) {
              // Silently fail on selector errors
            }
          });
        }, 1000);
      };

      // Add load event listener to iframe
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.addEventListener('load', handleIframeLoad);
        
        return () => {
          iframe.removeEventListener('load', handleIframeLoad);
          if (adCleanupIntervalRef.current) {
            window.clearInterval(adCleanupIntervalRef.current);
            adCleanupIntervalRef.current = null;
          }
        };
      }
    } else if (video.source === 'youtube') {
      // YouTube loading is handled by onLoad prop
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
                sandbox="allow-same-origin allow-scripts allow-forms"
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
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the embed URL based on the source
  const embedUrl = video.source === 'youtube'
    ? `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`
    : video.metadata?.embedUrl || '';

  // Ad blocking for VidSrc - different approach
  useEffect(() => {
    if (video.source === 'vidsrc') {
      // Function to handle loaded iframe
      const handleLoad = () => {
        setIsLoading(false);
      };

      // Add event listener
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.addEventListener('load', handleLoad);
        
        // Clean up function
        return () => {
          iframe.removeEventListener('load', handleLoad);
        };
      }
    }
  }, [video.source, video.sourceId]);

  // For VidSrc, intercept and block ad requests
  useEffect(() => {
    // For VidSrc videos, we need to monitor for ad scripts and popups  
    if (video.source === 'vidsrc') {
      // This function is called every second to check for and remove ad elements
      const cleanupInterval = setInterval(() => {
        if (containerRef.current) {
          // Find and remove any ad-related iframes in our container that appeared
          const popupIframes = document.querySelectorAll('iframe[src*="acscdn"]');
          const popupDivs = document.querySelectorAll('div[style*="z-index: 9999"]');
          const adDivs = document.querySelectorAll('div[id*="ad"], div[class*="ad"], div[id*="pop"], div[class*="pop"]');
          
          // Remove all these elements
          const removeElement = (el: Element) => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          };
          
          // Handle each collection individually to avoid spread syntax issues
          popupIframes.forEach(removeElement);
          popupDivs.forEach(removeElement);
          adDivs.forEach(removeElement);
          
          // Also look for any appended scripts with ad-related URLs
          const adScripts = document.querySelectorAll('script[src*="ad"], script[src*="pop"], script[src*="banner"]');
          adScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          });
        }
      }, 500);
      
      return () => {
        clearInterval(cleanupInterval);
      };
    }
  }, [video.source]);

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
    <div className="w-full" ref={containerRef}>
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
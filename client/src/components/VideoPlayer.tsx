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
            // More comprehensive list of ad and popup selectors
            const selectors = [
              // Popup containers
              'div[style*="position: fixed"][style*="z-index"]',
              'div[style*="position:fixed"][style*="z-index"]',
              'div[style*="position:absolute"][style*="z-index"]',
              
              // Common ad containers
              'div[id*="AdDisplay"]',
              'div[class*="ad-"]',
              'div[class*="-ad"]',
              'div[class*="adi"]',
              'div[class*="opads"]',
              'div[class*="overlay"]',
              'div[id*="popup"]',
              
              // Various iframe ads
              'iframe[src*="ads"]',
              'iframe[src*="adst"]',
              'iframe[src*="doubleclick"]',
              'iframe[src*="pop"]'
            ];
            
            // Apply all selectors
            selectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                // Only remove if not part of the main content
                if (el.parentNode && 
                    !el.classList.contains('video-player') &&
                    !el.id?.includes('video-player')) {
                  
                  // For fixed elements, check zIndex
                  if (selector.includes('position')) {
                    const style = window.getComputedStyle(el);
                    const zIndex = parseInt(style.zIndex);
                    
                    // Only remove if it's likely an overlay
                    if (zIndex > 999) {
                      console.log('Removing popup overlay:', el);
                      el.parentNode.removeChild(el);
                    }
                  } else {
                    console.log('Removing ad element:', el);
                    el.parentNode.removeChild(el);
                  }
                }
              });
            });
            
            // Also remove onclick handlers that might trigger popups
            document.onclick = null;
            document.body.onclick = null;
            
          } catch (e) {
            // Silently ignore errors
            console.log('Ad removal error:', e);
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
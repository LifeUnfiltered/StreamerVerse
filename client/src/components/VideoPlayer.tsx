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

  // Ad blocking for VidSrc
  useEffect(() => {
    if (video.source === 'vidsrc' && iframeRef.current) {
      const handleIframeLoad = () => {
        setIsLoading(false);
        
        if (!iframeRef.current) return;

        try {
          // Access iframe content
          const iframeDocument = iframeRef.current.contentDocument || 
                               (iframeRef.current.contentWindow?.document);
          
          if (!iframeDocument) return;

          // Remove ads and popups
          const observer = new MutationObserver(() => {
            // Function to hide ad elements
            const hideAds = () => {
              // Target common ad selectors
              const adSelectors = [
                '[id*="pop"]', 
                '[class*="ad"]', 
                '[id*="ads"]', 
                '[class*="ads"]',
                '[id*="banner"]',
                '[class*="banner"]',
                'iframe:not([src*="player"])',
                'div[style*="z-index: 99999"]',
                'div[style*="position: fixed"]'
              ];
              
              // Select all ad elements
              adSelectors.forEach(selector => {
                try {
                  const elements = iframeDocument.querySelectorAll(selector);
                  elements.forEach((el: Element) => {
                    (el as HTMLElement).style.display = 'none';
                  });
                } catch (e) {
                  // Ignore errors for cross-origin frames
                }
              });
            };
            
            // Run initially and on any DOM change
            hideAds();
          });
          
          // Start observing the iframe document
          observer.observe(iframeDocument.body, { 
            childList: true, 
            subtree: true 
          });
          
          return () => observer.disconnect();
        } catch (error) {
          console.log('Cannot access iframe content due to cross-origin policy');
        }
      };

      // Add load event listener to iframe
      const iframe = iframeRef.current;
      iframe.addEventListener('load', handleIframeLoad);
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
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
                sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
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
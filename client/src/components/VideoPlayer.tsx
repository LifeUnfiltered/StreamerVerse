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
  
  // Define array of VidSrc domains to try (from newest to oldest)
  const vidSrcDomains = ['vidsrc.xyz', 'vidsrc.pm', 'vidsrc.in', 'vidsrc.net'];
  const preferredDomain = vidSrcDomains[0]; // Default to the newest domain
  
  if (video.source === 'youtube') {
    embedUrl = `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`;
  } else if (video.source === 'vidsrc') {
    // Check if it's a movie or TV show episode
    const imdbId = video.metadata?.imdbId || (video.sourceId.startsWith('tt') ? video.sourceId : null);

    // If we have a valid IMDB ID
    if (imdbId) {
      if (video.metadata?.type === 'movie') {
        // Use the new API format for movies
        embedUrl = `https://${preferredDomain}/embed/movie?imdb=${imdbId}`;
      } else if (video.metadata?.type === 'tv') {
        // For TV shows, check if it has season and episode info
        const season = video.metadata.season || 1;
        const episode = video.metadata.episode || 1;
        embedUrl = `https://${preferredDomain}/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
      }
    }
    
    // If a direct embed URL was provided in the metadata (and we couldn't generate one)
    if (!embedUrl && video.metadata?.embedUrl) {
      // Fallback to the embedUrl provided directly, but update the domain to preferred one
      let directUrl = video.metadata.embedUrl;
      
      // Try to update the domain if it's using an old VidSrc domain
      for (const domain of vidSrcDomains) {
        if (directUrl.includes(domain)) {
          // Already using this domain, no need to change
          embedUrl = directUrl;
          break;
        } else if (vidSrcDomains.some(d => directUrl.includes(d))) {
          // Replace the old domain with the preferred one
          vidSrcDomains.forEach(d => {
            if (directUrl.includes(d)) {
              directUrl = directUrl.replace(d, preferredDomain);
            }
          });
          embedUrl = directUrl;
          break;
        }
      }
      
      // If we couldn't update the domain, use the original URL
      if (!embedUrl) {
        embedUrl = directUrl;
      }
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
              {/* Show a proper episode description if available for TV show episodes */}
              {video.source === 'vidsrc' && video.metadata?.type === 'tv' && video.metadata?.season && video.metadata?.episode && 
               (video.description && video.description !== `Season ${video.metadata.season}, Episode ${video.metadata.episode}`) 
               ? video.description 
               : video.metadata?.type === 'tv'
                 ? `${video.title}${video.description && !video.description.startsWith('Season') ? `: ${video.description}` : ''}`
                 : video.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <FloatingActionButton video={video} />
    </div>
  );
}
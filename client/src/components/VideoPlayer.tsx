import { useState, useEffect, useRef } from 'react';
import type { Video } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PictureInPicture2, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import FloatingActionButton from "./FloatingActionButton";
import LoadingSpinner from "./LoadingSpinner";
import CastAndCrew from "./CastAndCrew";
import { AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPipMode, setIsPipMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();

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

  // Estimation for video duration based on metadata 
  useEffect(() => {
    if (video.metadata?.runtime) {
      // If we have runtime in minutes, convert to seconds
      setDuration(video.metadata.runtime * 60);
    } else {
      // Default duration if not specified (for tracking purposes)
      setDuration(video.source === 'youtube' ? 600 : 2400); // 10 mins for YT, 40 mins for shows
    }
  }, [video.metadata, video.source]);

  // Track watch progress
  const { mutate: updateWatchProgress } = useMutation({
    mutationFn: async (data: { 
      videoId: string, 
      position: number, 
      isCompleted: boolean,
      duration: number,
      videoData: Video 
    }) => {
      try {
        // Check if this is the first time tracking this video
        const isNewWatch = lastUpdateTimeRef.current === 0;
        
        if (isNewWatch) {
          // First time tracking, add to watch history
          await apiRequest('POST', `/api/watch-history/${data.videoId}`, {
            position: data.position,
            duration: data.duration,
            videoData: data.videoData
          });
        } else {
          // Update existing watch progress
          await apiRequest('PATCH', `/api/watch-history/${data.videoId}`, {
            position: data.position,
            isCompleted: data.isCompleted
          });
        }
        
        // Update last update time
        lastUpdateTimeRef.current = Date.now();
        
        return true;
      } catch (error) {
        console.error('Failed to update watch progress:', error);
        return false;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/watch-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/continue-watching'] });
    }
  });

  // Track watch progress periodically (every 10 seconds)
  useEffect(() => {
    // Only track if we have a valid video and it's not loading
    if (!isLoading && video && video.sourceId) {
      // Setup periodic progress tracking
      const trackingInterval = setInterval(() => {
        // Get estimated current time (this is a simplification since we can't directly 
        // access the iframe player's actual time)
        const estimatedTime = currentTime + 10; // Add 10 seconds since last update
        setCurrentTime(estimatedTime);
        
        // Calculate if video is completed (90% watched)
        const isCompleted = estimatedTime >= duration * 0.9;
        
        // Update watch progress
        updateWatchProgress({
          videoId: video.sourceId,
          position: estimatedTime,
          isCompleted,
          duration,
          videoData: video
        });
        
      }, 10000); // Update every 10 seconds
      
      return () => {
        clearInterval(trackingInterval);
        
        // When component unmounts, do a final update
        if (currentTime > 0) {
          const isCompleted = currentTime >= duration * 0.9;
          updateWatchProgress({
            videoId: video.sourceId,
            position: currentTime,
            isCompleted,
            duration,
            videoData: video
          });
        }
      };
    }
  }, [video, isLoading, updateWatchProgress, currentTime, duration]);

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

  // Function to enter Picture-in-Picture mode
  const enterPictureInPicture = () => {
    if (document.pictureInPictureElement) {
      // Already in PiP mode, exit it
      document.exitPictureInPicture()
        .then(() => {
          setIsPipMode(false);
          toast({
            description: "Exited Picture-in-Picture mode",
          });
        })
        .catch(error => {
          console.error("Error exiting Picture-in-Picture mode:", error);
          toast({
            variant: "destructive",
            description: "Failed to exit Picture-in-Picture mode",
          });
        });
    } else if (iframeRef.current) {
      try {
        // Attempt to request PiP mode with the iframe
        // This works differently based on browser - some support iframe PiP, others don't
        if ('requestPictureInPicture' in iframeRef.current) {
          // @ts-ignore - TypeScript doesn't know about this method on iframe
          iframeRef.current.requestPictureInPicture()
            .then(() => {
              setIsPipMode(true);
              toast({
                description: "Entered Picture-in-Picture mode",
              });
            })
            .catch((err: Error) => {
              console.error("PiP error:", err);
              toast({
                variant: "destructive",
                description: "This browser doesn't support Picture-in-Picture for embedded videos",
              });
            });
        } else {
          // Fallback for browsers that don't support PiP on iframes
          toast({
            variant: "destructive",
            description: "This browser doesn't support Picture-in-Picture for embedded videos",
          });
        }
      } catch (error) {
        console.error("Error entering Picture-in-Picture mode:", error);
        toast({
          variant: "destructive",
          description: "Failed to enter Picture-in-Picture mode",
        });
      }
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
      toast({
        variant: "destructive",
        description: "Fullscreen mode is not available",
      });
    }
  };

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
          <div className="space-y-4" ref={containerRef}>
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
            
            {/* Video controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={enterPictureInPicture}
                  title="Picture-in-Picture"
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {/* Release date information */}
              <div className="flex flex-wrap gap-2">
                {/* Movie release date & info */}
                {video.metadata?.type === 'movie' && video.metadata.releaseDate && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Released: {new Date(video.metadata.releaseDate).toLocaleDateString()}</span>
                    {video.metadata.voteAverage && 
                      <span className="ml-2 px-2 py-0.5 bg-primary/20 rounded-full">
                        ★ {video.metadata.voteAverage.toFixed(1)}
                      </span>
                    }
                  </div>
                )}
                
                {/* Movie runtime */}
                {video.metadata?.type === 'movie' && video.metadata.runtime && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Duration: {video.metadata.runtime} min</span>
                  </div>
                )}
                
                {/* Movie content rating */}
                {video.metadata?.type === 'movie' && video.metadata.contentRating && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Rated: {video.metadata.contentRating}</span>
                  </div>
                )}
                
                {/* TV Show air dates */}
                {video.metadata?.type === 'tv' && !video.metadata.season && (
                  <div className="flex flex-wrap gap-2">
                    {video.metadata.firstAirDate && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span>First aired: {new Date(video.metadata.firstAirDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {video.metadata.lastAirDate && video.metadata.lastAirDate !== video.metadata.firstAirDate && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span>Last aired: {new Date(video.metadata.lastAirDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {video.metadata.voteAverage && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        <span>★ {video.metadata.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* TV Episode air date & info */}
                {video.metadata?.type === 'tv' && video.metadata.season && video.metadata.episode && (
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <span>S{video.metadata.season} E{video.metadata.episode}</span>
                    </div>
                    {video.metadata.airDate && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span>Aired: {new Date(video.metadata.airDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {video.metadata.runtime && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span>Duration: {video.metadata.runtime} min</span>
                      </div>
                    )}
                    {video.metadata.contentRating && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span>Rated: {video.metadata.contentRating}</span>
                      </div>
                    )}
                    {video.metadata.voteAverage && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        <span>★ {video.metadata.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {/* Show a proper episode description if available for TV show episodes */}
                {video.source === 'vidsrc' && video.metadata?.type === 'tv' && video.metadata?.season && video.metadata?.episode ? (
                  <>
                    {(() => {
                      // Check if we have a non-generic description
                      const isGenericDescription = !video.description || 
                        video.description === `Season ${video.metadata.season}, Episode ${video.metadata.episode}` ||
                        video.description.startsWith("Season ") || 
                        video.description.startsWith("S");
                      
                      if (!isGenericDescription) {
                        // Real description available, use it
                        return video.description;
                      } else if (video.title && video.title.includes(' - ')) {
                        // Extract the episode title to use as minimal description
                        const parts = video.title.split(' - ');
                        return `${parts[0]}: ${parts[1]}`;
                      } else {
                        // Fall back to showing the full title as descriptor
                        return video.title;
                      }
                    })()}
                  </>
                ) : (
                  // For non-TV content or content without proper metadata
                  video.description || video.title
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Separator className="mb-4" />
        <CastAndCrew video={video} />
      </div>
      
      <FloatingActionButton video={video} />
    </div>
  );
}
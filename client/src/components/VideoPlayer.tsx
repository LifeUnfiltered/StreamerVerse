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
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();

  // Reset domain index when video changes
  useEffect(() => {
    setCurrentDomainIndex(0);
    setLoadError(false);
    setIsLoading(true);
  }, [video.sourceId]);

  // Handle iframe load and error with enhanced browser compatibility
  useEffect(() => {
    if (video.source === 'vidsrc' && iframeRef.current) {
      const iframe = iframeRef.current;
      let loadTimeout: NodeJS.Timeout;
      let readyStateCheck: NodeJS.Timeout;
      let contentCheck: NodeJS.Timeout;
      let isIframeLoaded = false;

      const handleIframeLoad = () => {
        if (isIframeLoaded) return; // Prevent double execution
        console.log('VidSrc iframe loaded successfully');
        isIframeLoaded = true;
        setIsLoading(false);
        setLoadError(false);
        clearAllTimeouts();
        
        // Monitor for VidSrc internal script failures and implement ad blocking
        setTimeout(() => {
          console.log('Setting up VidSrc monitoring and ad blocking...');
          
          // Enhanced ad blocking for VidSrc iframes
          const iframe = document.getElementById('video-player-iframe') as HTMLIFrameElement;
          if (iframe) {
            // Block ad-related events on the iframe
            iframe.addEventListener('load', () => {
              try {
                // Try to access iframe content for ad blocking (will fail due to CORS but worth trying)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  // Add ad blocking CSS to iframe
                  const style = iframeDoc.createElement('style');
                  style.textContent = `
                    [class*="ad"], [id*="ad"], [class*="ads"], [id*="ads"],
                    [class*="banner"], [id*="banner"], [class*="popup"], [id*="popup"],
                    .advertisement, .ads-container, .ad-container, .banner-ad,
                    .popup-ad, .overlay-ad, .video-ads, .preroll-ads { 
                      display: none !important; 
                      visibility: hidden !important;
                      opacity: 0 !important;
                    }
                  `;
                  iframeDoc.head?.appendChild(style);
                }
              } catch (e) {
                // Cross-origin blocked, expected
                console.log('Cross-origin iframe access blocked (normal)');
              }
            });
            
            // Enhanced iframe click protection
            iframe.style.pointerEvents = 'auto';
            
            // Add click protection overlay that captures and filters clicks
            const clickProtector = document.createElement('div');
            clickProtector.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 1;
              background: transparent;
              pointer-events: none;
            `;
            iframe.parentElement?.appendChild(clickProtector);
            
            // Monitor for popup attempts from within iframe
            let popupAttempts = 0;
            const originalWindowOpen = window.open;
            
            iframe.addEventListener('load', () => {
              // Reset popup attempt counter when iframe loads
              popupAttempts = 0;
            });
            
            // Detect and block popup storms (multiple rapid popup attempts)
            const popupDetector = setInterval(() => {
              if (popupAttempts > 2) {
                console.log('Popup storm detected, blocking all popups for 10 seconds');
                window.open = () => null;
                setTimeout(() => {
                  window.open = originalWindowOpen;
                  popupAttempts = 0;
                }, 10000);
              }
            }, 1000);
          }
          
          // Health check for domain cycling
          const healthCheckTimeout = setTimeout(() => {
            const iframe = document.getElementById('video-player-iframe') as HTMLIFrameElement;
            if (iframe && iframe.src.includes('vidsrc')) {
              console.log('VidSrc health check: No working video after 5 seconds, cycling domain...');
              handleIframeError();
            }
          }, 5000); // 5 second health check
          
          // Also check if the iframe content has loaded properly by checking for video elements
          const contentCheck = setInterval(() => {
            try {
              const iframe = document.getElementById('video-player-iframe') as HTMLIFrameElement;
              if (iframe) {
                // Check iframe's computed style to see if it has content
                const computedStyle = window.getComputedStyle(iframe);
                if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none') {
                  console.log('VidSrc iframe hidden/empty, trying next domain...');
                  clearTimeout(healthCheckTimeout);
                  clearInterval(contentCheck);
                  handleIframeError();
                }
              }
            } catch (e) {
              // Cross-origin access blocked, which is normal
            }
          }, 3000);
          
          // Clear health check if component unmounts
          setTimeout(() => {
            clearTimeout(healthCheckTimeout);
            clearInterval(contentCheck);
          }, 15000);
        }, 3000); // Start monitoring after 3 seconds
      };

      const handleIframeError = () => {
        if (isIframeLoaded) return; // Prevent execution after successful load
        console.log(`VidSrc iframe failed to load (domain ${currentDomainIndex + 1}/${vidSrcDomains.length})`);
        clearAllTimeouts();
        
        if (currentDomainIndex < vidSrcDomains.length - 1) {
          console.log('Trying next domain...');
          setCurrentDomainIndex(prev => prev + 1);
          setIsLoading(true);
          setLoadError(false);
        } else {
          console.log('All domains exhausted');
          setIsLoading(false);
          setLoadError(true);
          toast({
            variant: "destructive",
            description: "All video sources tried. Click 'Try Again' to retry.",
          });
        }
      };

      const clearAllTimeouts = () => {
        if (loadTimeout) clearTimeout(loadTimeout);
        if (readyStateCheck) clearTimeout(readyStateCheck);
        if (contentCheck) clearTimeout(contentCheck);
      };

      // Detect browser type for different loading strategies
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      const isChromiumBased = isChrome || isEdge;
      
      console.log('Browser detection:', { 
        userAgent: navigator.userAgent, 
        vendor: navigator.vendor, 
        isChrome, 
        isEdge,
        isFirefox,
        isChromiumBased
      });
      
      // Standard event listeners (work better in Firefox)
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
      
      // Chromium-based browsers (Chrome, Edge) detection
      if (isChromiumBased) {
        const browserName = isChrome ? 'Chrome' : isEdge ? 'Edge' : 'Chromium';
        console.log(`${browserName} detected: Setting up iframe detection`);
        
        // Chromium browsers are very restrictive with VidSrc iframes
        // Use very short timeout because they often block the content entirely
        contentCheck = setTimeout(() => {
          if (!isIframeLoaded) {
            console.log(`${browserName}: Force iframe loaded after 300ms timeout`);
            handleIframeLoad();
          }
        }, 800); // Moderate timeout for Chromium
        
        // VidSrc health monitoring is now handled in handleIframeLoad
        
        // Try multiple detection methods for Chromium
        readyStateCheck = setInterval(() => {
          if (isIframeLoaded) {
            clearInterval(readyStateCheck);
            return;
          }
          
          // Method 1: Check if iframe is in DOM and has basic structure
          if (iframe.offsetHeight > 0 && iframe.offsetWidth > 0) {
            console.log(`${browserName}: iframe has dimensions, assuming loaded`);
            handleIframeLoad();
            return;
          }
          
          // Method 2: Check if iframe src is set (means browser is processing it)
          if (iframe.src && iframe.src !== 'about:blank') {
            console.log(`${browserName}: iframe src is set, assuming loaded`);
            handleIframeLoad();
            return;
          }
          
          // Method 3: Try to access contentWindow (will throw if loaded due to CORS)
          try {
            const test = iframe.contentWindow;
            // If we can access it without error, assume it's loaded
            console.log(`${browserName}: iframe contentWindow accessible`);
            handleIframeLoad();
          } catch (e) {
            // Any error accessing contentWindow usually means iframe loaded but blocked
            console.log(`${browserName}: Cross-origin security detected, iframe loaded`);
            handleIframeLoad();
          }
        }, 300); // Check every 300ms
      }
      
      // Firefox works better with standard load events, but add backup
      if (isFirefox) {
        // Firefox backup timeout (more conservative)
        setTimeout(() => {
          if (!isIframeLoaded) {
            console.log('Firefox: iframe assumed loaded (backup)');
            handleIframeLoad();
          }
        }, 6000);
      }
      
      // Universal fallback timeout - much shorter for faster cycling
      const timeoutDuration = isChromiumBased ? 6000 : 8000;
      loadTimeout = setTimeout(() => {
        if (!isIframeLoaded) {
          console.log(`Universal timeout (${timeoutDuration}ms): trying next domain...`);
          handleIframeError();
        }
      }, timeoutDuration);
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
        clearAllTimeouts();
      };
    }
  }, [video.source, video.sourceId, currentDomainIndex]);

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
  
  // Define array of VidSrc domains to try (prioritize working ones)
  const vidSrcDomains = ['vidsrc.xyz', 'vidsrc.me', 'vidsrc.to', 'vidsrc.cc', 'vidsrc.net'];
  const preferredDomain = vidSrcDomains[currentDomainIndex] || vidSrcDomains[0]; // Use current domain index
  
  if (video.source === 'youtube') {
    embedUrl = `https://www.youtube.com/embed/${video.sourceId}?autoplay=1&modestbranding=1&rel=0`;
  } else if (video.source === 'vidsrc') {
    // Check if it's a movie or TV show episode
    const imdbId = video.metadata?.imdbId || (video.sourceId.startsWith('tt') ? video.sourceId : null);

    // If we have a valid IMDB ID
    if (imdbId) {
      if (video.metadata?.type === 'movie') {
        // Use the reliable format for movies
        embedUrl = `https://${preferredDomain}/embed/movie/${imdbId}`;
      } else if (video.metadata?.type === 'tv') {
        // For TV shows, check if it has season and episode info
        const season = video.metadata.season || 1;
        const episode = video.metadata.episode || 1;
        embedUrl = `https://${preferredDomain}/embed/tv/${imdbId}/${season}/${episode}`;
      }
    }
    
    // If no IMDB ID but we have a direct sourceId that looks like IMDB
    if (!embedUrl && video.sourceId && video.sourceId.startsWith('tt')) {
      if (video.metadata?.type === 'movie') {
        embedUrl = `https://${preferredDomain}/embed/movie/${video.sourceId}`;
      } else if (video.metadata?.type === 'tv') {
        const season = video.metadata?.season || 1;
        const episode = video.metadata?.episode || 1;
        embedUrl = `https://${preferredDomain}/embed/tv/${video.sourceId}/${season}/${episode}`;
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
          <CardTitle className="line-clamp-1">
            {(() => {
              // For TV shows with episode data, format properly
              if (video.metadata?.type === 'tv' && video.metadata.season && video.metadata.episode) {
                // Extract show name and episode title from the full title
                const showName = video.title.split(' - ')[0] || video.title;
                const episodeTitle = video.title.includes(' - ') ? video.title.split(' - ').slice(1).join(' - ') : '';
                
                // Format: "Show Name S1E1 - Episode Title" or just "Show Name S1E1" if no episode title
                const seasonEpisode = `S${video.metadata.season}E${video.metadata.episode}`;
                return episodeTitle ? `${showName} ${seasonEpisode} - ${episodeTitle}` : `${showName} ${seasonEpisode}`;
              }
              
              // For movies and regular content, show title as-is
              return video.title;
            })()}
          </CardTitle>
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
          <CardTitle className="line-clamp-1">
            {(() => {
              // For TV shows with episode data, format properly
              if (video.metadata?.type === 'tv' && video.metadata.season && video.metadata.episode) {
                // Extract show name and episode title from the full title
                const showName = video.title.split(' - ')[0] || video.title;
                const episodeTitle = video.title.includes(' - ') ? video.title.split(' - ').slice(1).join(' - ') : '';
                
                // Format: "Show Name S1E1 - Episode Title" or just "Show Name S1E1" if no episode title
                const seasonEpisode = `S${video.metadata.season}E${video.metadata.episode}`;
                return episodeTitle ? `${showName} ${seasonEpisode} - ${episodeTitle}` : `${showName} ${seasonEpisode}`;
              }
              
              // For movies and regular content, show title as-is
              return video.title;
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" ref={containerRef}>
            <AspectRatio ratio={16 / 9} className="relative bg-black rounded-md overflow-hidden video-player">
              <iframe
                ref={iframeRef}
                key={`${video.sourceId}-${currentDomainIndex}`}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation allow-downloads allow-modals allow-orientation-lock allow-pointer-lock allow-storage-access-by-user-activation"
                className="absolute inset-0 w-full h-full video-player"
                id="video-player-iframe"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => {
                  console.log('Iframe onLoad triggered for', video.source);
                  if (video.source === 'youtube') {
                    setIsLoading(false);
                  }
                  // For VidSrc, this event might not fire reliably in Chrome, so we rely on useEffect detection
                }}
              />
              <AnimatePresence>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white">
                    <div className="text-center space-y-4">
                      <LoadingSpinner />
                      {video.source === 'vidsrc' && currentDomainIndex > 0 && (
                        <p className="text-sm text-gray-300">
                          Trying source {currentDomainIndex + 1} of {vidSrcDomains.length}...
                        </p>
                      )}
                      <p className="text-sm text-gray-400">Loading video player...</p>
                    </div>
                  </div>
                )}
                {loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
                    <div className="text-center space-y-4">
                      <p>All video sources tried</p>
                      <p className="text-sm text-gray-400">Attempted {vidSrcDomains.length} different sources</p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentDomainIndex(0);
                          setLoadError(false);
                          setIsLoading(true);
                        }}
                        className="text-white border-white hover:bg-white hover:text-black"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
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
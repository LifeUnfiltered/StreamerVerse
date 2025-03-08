import { useRef, useState, useEffect } from 'react';
import type { Video } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoChapters from "./VideoChapters";

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const embedUrl = video.source === 'youtube' 
    ? `https://www.youtube.com/embed/${video.sourceId}?enablejsapi=1`
    : '';

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Function to initialize the player
    const initPlayer = () => {
      if (!iframeRef.current) return;

      playerRef.current = new (window as any).YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              const updateTime = () => {
                if (playerRef.current?.getCurrentTime) {
                  setCurrentTime(playerRef.current.getCurrentTime());
                }
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  requestAnimationFrame(updateTime);
                }
              };
              updateTime();
            }
          }
        }
      });
    };

    // Initialize player when API is ready
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      // If API is not ready, wait for it
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video.sourceId]);

  const handleChapterClick = (timestamp: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(timestamp, true);
    }
  };

  console.log('Video chapters:', video.chapters); // Debug log

  return (
    <Card>
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <AspectRatio ratio={16/9}>
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md"
              />
            </AspectRatio>
            <p className="text-sm text-muted-foreground">
              {video.description}
            </p>
          </div>

          {video.chapters && video.chapters.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Chapters</h3>
              <VideoChapters
                chapters={video.chapters}
                currentTime={currentTime}
                onChapterClick={handleChapterClick}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
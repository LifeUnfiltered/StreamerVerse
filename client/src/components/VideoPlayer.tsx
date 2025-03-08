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

  const embedUrl = video.source === 'youtube' 
    ? `https://www.youtube.com/embed/${video.sourceId}?enablejsapi=1`
    : '';

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    let player: any;

    // Initialize player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      player = new (window as any).YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            // Update currentTime when video is playing
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              const updateTime = () => {
                if (player?.getCurrentTime) {
                  setCurrentTime(player.getCurrentTime());
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

    return () => {
      // Cleanup
      player?.destroy();
    };
  }, [video.sourceId]);

  const handleChapterClick = (timestamp: number) => {
    if (iframeRef.current) {
      // Access the player through the iframe element
      const player = new (window as any).YT.Player(iframeRef.current);
      player.seekTo(timestamp, true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {video.chapters && video.chapters.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Chapters</h3>
            <VideoChapters
              chapters={video.chapters}
              currentTime={currentTime}
              onChapterClick={handleChapterClick}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {video.description}
        </p>
      </CardContent>
    </Card>
  );
}
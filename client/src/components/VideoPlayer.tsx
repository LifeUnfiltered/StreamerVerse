import { useRef, useState, useEffect } from 'react';
import type { Video } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoChapters from "./VideoChapters";
import FloatingActionButton from "./FloatingActionButton";

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
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

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

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
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

  console.log('Video chapters:', video.chapters);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="line-clamp-1">{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
            <div className="space-y-4">
              <AspectRatio ratio={16 / 9}>
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
              <div className="relative min-w-[250px]">
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

      <FloatingActionButton video={video} currentTime={currentTime} />
    </>
  );
}
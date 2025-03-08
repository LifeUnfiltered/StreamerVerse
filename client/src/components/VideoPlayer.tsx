import type { Video } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const embedUrl = video.source === 'youtube' 
    ? `https://www.youtube.com/embed/${video.sourceId}`
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AspectRatio ratio={16/9}>
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          />
        </AspectRatio>
        <p className="mt-4 text-sm text-muted-foreground">
          {video.description}
        </p>
      </CardContent>
    </Card>
  );
}

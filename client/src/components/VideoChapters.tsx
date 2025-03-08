import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Chapter } from "@shared/schema";

interface VideoChaptersProps {
  chapters: Chapter[];
  currentTime: number;
  onChapterClick: (timestamp: number) => void;
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function VideoChapters({ 
  chapters, 
  currentTime,
  onChapterClick 
}: VideoChaptersProps) {
  if (!chapters?.length) return null;

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-2">
        {chapters.map((chapter, index) => {
          const isActive = currentTime >= chapter.timestamp && 
            (index === chapters.length - 1 || currentTime < chapters[index + 1].timestamp);

          return (
            <Button
              key={chapter.timestamp}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-accent"
              )}
              onClick={() => onChapterClick(chapter.timestamp)}
            >
              <span className="text-muted-foreground font-mono shrink-0">
                {formatTimestamp(chapter.timestamp)}
              </span>
              <span className="truncate">{chapter.title}</span>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
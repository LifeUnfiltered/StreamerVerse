import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, Clock, MonitorPlay, X, MoreVertical } from "lucide-react";
import type { Video } from "@shared/schema";

interface FloatingActionButtonProps {
  video: Video;
  currentTime?: number;
}

export default function FloatingActionButton({ video, currentTime }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video.title,
        text: video.description || '',
        url: `https://youtube.com/watch?v=${video.sourceId}`
      });
    } catch (error) {
      // Fallback to copying link if share API is not supported
      navigator.clipboard.writeText(`https://youtube.com/watch?v=${video.sourceId}`);
    }
  };

  const handleCopyTimestamp = () => {
    if (currentTime) {
      const timestamp = Math.floor(currentTime);
      navigator.clipboard.writeText(
        `https://youtube.com/watch?v=${video.sourceId}&t=${timestamp}`
      );
    }
  };

  const handlePictureInPicture = async () => {
    try {
      const videoElement = document.querySelector('iframe');
      if (videoElement && document.pictureInPictureElement !== videoElement) {
        await (videoElement as any).requestPictureInPicture();
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture failed:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2"
          >
            <Button
              size="icon"
              variant="secondary"
              onClick={handleShare}
              className="shadow-lg"
              title="Share video"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            {currentTime !== undefined && (
              <Button
                size="icon"
                variant="secondary"
                onClick={handleCopyTimestamp}
                className="shadow-lg"
                title="Copy current timestamp"
              >
                <Clock className="h-5 w-5" />
              </Button>
            )}

            <Button
              size="icon"
              variant="secondary"
              onClick={handlePictureInPicture}
              className="shadow-lg"
              title="Toggle picture-in-picture mode"
            >
              <MonitorPlay className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="shadow-lg h-12 w-12 rounded-full"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MoreVertical className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
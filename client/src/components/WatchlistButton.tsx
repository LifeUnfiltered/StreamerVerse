import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

interface WatchlistButtonProps {
  video: Video;
  onAuthRequired: () => void;
}

export default function WatchlistButton({ video, onAuthRequired }: WatchlistButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlist } = useQuery<Video[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/watchlist');
        return res.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          return null;
        }
        throw error;
      }
    }
  });

  const isInWatchlist = watchlist?.some(item => item.sourceId === video.sourceId);

  const { mutate: toggleWatchlist, isPending } = useMutation({
    mutationFn: async () => {
      if (isInWatchlist) {
        await apiRequest('DELETE', `/api/watchlist/${video.sourceId}`);
      } else {
        await apiRequest('POST', `/api/watchlist/${video.sourceId}`);
      }
    },
    onError: (error) => {
      if (error instanceof Error && error.message.includes('401')) {
        onAuthRequired();
      } else {
        toast({
          variant: "destructive",
          description: "Failed to update watchlist",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        description: isInWatchlist 
          ? "Removed from watchlist" 
          : "Added to watchlist",
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={() => toggleWatchlist()}
      title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isInWatchlist ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}

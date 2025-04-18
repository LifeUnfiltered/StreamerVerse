import { SiYoutube } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogIn, LogOut, User as UserIcon, Bookmark, TrendingUp } from "lucide-react";
import type { Video } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAuthClick: () => void;
  onWatchlistClick: () => void;
  onTrendingClick?: () => void;
}

export default function Header({ onAuthClick, onWatchlistClick, onTrendingClick }: HeaderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlist, isError: watchlistError } = useQuery<Video[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/watchlist');
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch watchlist');
        }
        return res.json();
      } catch (error) {
        console.error('Watchlist error:', error);
        throw error;
      }
    },
    retry: false
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        description: "Successfully logged out"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to logout"
      });
    }
  });

  const isLoggedIn = watchlist !== null && !watchlistError;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SiYoutube className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Streamer Verse
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {onTrendingClick && (
            <Button variant="ghost" size="sm" onClick={onTrendingClick} className="hidden md:flex">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Trending</span>
            </Button>
          )}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onWatchlistClick} className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Watchlist</span>
                    {watchlist && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {watchlist.length}
                      </span>
                    )}
                  </DropdownMenuItem>
                  {onTrendingClick && (
                    <DropdownMenuItem onClick={onTrendingClick} className="cursor-pointer md:hidden">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Trending</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={onAuthClick} className="cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log in</span>
                  </DropdownMenuItem>
                  {onTrendingClick && (
                    <DropdownMenuItem onClick={onTrendingClick} className="cursor-pointer md:hidden">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Trending</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
import { SiYoutube } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogIn, LogOut } from "lucide-react";
import type { Video } from "@shared/schema";

interface HeaderProps {
  onAuthClick: () => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const queryClient = useQueryClient();

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

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const isLoggedIn = watchlist !== null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SiYoutube className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Video Stream
          </h1>
        </div>

        <Button 
          variant="ghost"
          onClick={isLoggedIn ? () => logout() : onAuthClick}
        >
          {isLoggedIn ? (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AuthDialog({ isOpen, onOpenChange, onSuccess }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Login failed';
        try {
          const error = JSON.parse(text);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', text);
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse response:', text);
        return {};
      }
    },
    onSuccess: () => {
      toast({ description: "Logged in successfully" });
      onSuccess();
      onOpenChange(false);
      setUsername("");
      setPassword("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Login failed",
      });
    },
  });

  const { mutate: register, isPending: isRegisterPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/register", {
        username,
        password,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Registration failed';
        try {
          const error = JSON.parse(text);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', text);
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse response:', text);
        return {};
      }
    },
    onSuccess: () => {
      toast({ description: "Registered successfully! You can now log in." });
      setIsLogin(true);
      setUsername("");
      setPassword("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Registration failed",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      toast({
        variant: "destructive",
        description: "Username and password are required",
      });
      return;
    }
    if (isLogin) {
      login();
    } else {
      register();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLogin ? "Login" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Sign in to access your watchlist and favorites"
              : "Create an account to save your watchlist and preferences"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground"
            >
              {isLogin ? "Need an account?" : "Already have an account?"}
            </Button>
            <Button type="submit" disabled={isLoginPending || isRegisterPending}>
              {isLogin 
                ? (isLoginPending ? "Logging in..." : "Login")
                : (isRegisterPending ? "Creating account..." : "Create Account")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
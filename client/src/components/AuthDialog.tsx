import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      toast({ description: "Logged in successfully" });
      onSuccess();
      onOpenChange(false);
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
      const res = await apiRequest("POST", "/api/auth/register", {
        email,
        password,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ description: "Registered successfully" });
      onSuccess();
      onOpenChange(false);
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
          <DialogTitle>{isLogin ? "Login" : "Register"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Sign in to your account"
              : "Create a new account to save your preferences"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account?" : "Already have an account?"}
            </Button>
            <Button type="submit" disabled={isLoginPending || isRegisterPending}>
              {isLogin ? "Login" : "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

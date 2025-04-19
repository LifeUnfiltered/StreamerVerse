import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import confetti from 'canvas-confetti';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [previousTheme, setPreviousTheme] = useState(theme);
  const [showIntroAnim, setShowIntroAnim] = useState(true);
  
  // Detect if system preference is dark (for initial state)
  const [systemIsDark, setSystemIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Listen for changes in system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Remove intro animation after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntroAnim(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add transition effect to body when theme changes
  useEffect(() => {
    if (theme !== previousTheme) {
      // Get theme label
      const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';
      
      // Show toast notification
      toast({
        title: `Theme changed to ${themeLabel}`,
        description: "Your viewing experience has been updated.",
        variant: "default",
      });
      
      // Update previous theme
      setPreviousTheme(theme);
    }
    
    const body = document.body;
    body.classList.add('theme-transition');
    
    // Remove the class after animation completes
    const timeout = setTimeout(() => {
      body.classList.remove('theme-transition');
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [theme, previousTheme, toast]);

  // Determine if the current mode is dark
  const isDarkMode = 
    theme === 'dark' || 
    (theme === 'system' && systemIsDark);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    
    // Only trigger confetti if actually changing themes
    if (theme !== newTheme) {
      // Customize confetti based on theme
      const colors = newTheme === 'light' 
        ? ['#FFDD67', '#FFB800', '#fff'] 
        : ['#3b82f6', '#1e40af', '#172554'];
      
      // Fire confetti from the button area
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.15, x: 0.9 },
        colors: colors,
        disableForReducedMotion: true
      });
    }
    
    setTheme(newTheme);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`relative h-9 w-9 rounded-full transition-all 
              hover:shadow-md hover:shadow-primary/10
              ${showIntroAnim ? 'theme-button-attention' : ''}`}
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="relative"
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Switch to {isDarkMode ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
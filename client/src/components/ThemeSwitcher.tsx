import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Sun, Moon, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import confetti from 'canvas-confetti';

// Define theme color presets
const themePresets = {
  blue: { name: "Blue", color: "#3b82f6" },
  purple: { name: "Purple", color: "#8b5cf6" },
  green: { name: "Green", color: "#10b981" },
  orange: { name: "Orange", color: "#f97316" },
  red: { name: "Red", color: "#ef4444" },
  pink: { name: "Pink", color: "#ec4899" },
  teal: { name: "Teal", color: "#14b8a6" },
};

// Main theme toggler component
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [previousTheme, setPreviousTheme] = useState(theme);
  const [showIntroAnim, setShowIntroAnim] = useState(true);
  const [rotateDirection, setRotateDirection] = useState<number>(0);
  
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

  // Set theme to system preference initially
  useEffect(() => {
    if (theme !== 'system') {
      setTheme('system');
    }
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
    
    // Toggle rotation direction - alternate between clockwise (360) and counterclockwise (-360)
    setRotateDirection(prev => (prev === 0 || prev === -360) ? 360 : -360);
    
    // Only trigger confetti if actually changing themes
    if ((theme === 'dark' && newTheme === 'light') || (theme === 'light' && newTheme === 'dark') || 
        (theme === 'system' && systemIsDark && newTheme === 'light') || 
        (theme === 'system' && !systemIsDark && newTheme === 'dark')) {
      
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
          <motion.div
            initial={false}
            animate={{ 
              rotate: rotateDirection,
              scale: [1, 1.2, 0.95, 1.1, 1]
            }}
            transition={{ 
              duration: 0.7, 
              rotate: { 
                type: 'spring', 
                stiffness: 80,
                damping: 15
              },
              scale: {
                duration: 0.5,
                times: [0, 0.2, 0.5, 0.8, 1]
              }
            }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            className="theme-button-wrapper"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`relative h-9 w-9 rounded-full shadow-sm
                hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10
                spin-button bg-gradient-to-br from-background to-background/80
                ${showIntroAnim ? 'theme-button-attention' : ''}`}
              aria-label="Toggle theme"
            >
              <div className="relative theme-icon-container">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-blue-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Toggle {isDarkMode ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Separate component for color theme settings
export function ColorThemeButton() {
  const { toast } = useToast();
  const [activeColorTheme, setActiveColorTheme] = useState("blue");
  
  // Handle color theme change
  const changeColorTheme = (color: string) => {
    setActiveColorTheme(color);
    
    // Update CSS variables by manipulating the document root
    const root = document.documentElement;
    const colorValue = themePresets[color as keyof typeof themePresets].color;
    
    // Apply the primary color
    root.style.setProperty('--theme-primary', colorValue);
    
    // Create derived colors (lighter/darker variants)
    root.style.setProperty('--theme-primary-light', lightenColor(colorValue, 15));
    root.style.setProperty('--theme-primary-dark', darkenColor(colorValue, 15));
    
    // Show toast notification
    toast({
      title: `Color theme changed to ${themePresets[color as keyof typeof themePresets].name}`,
      description: "Your color theme has been updated.",
      variant: "default",
    });
  };

  // Helper function to lighten a color
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, ((num >> 16) & 0xff) + amt);
    const g = Math.min(255, ((num >> 8) & 0xff) + amt);
    const b = Math.min(255, (num & 0xff) + amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // Helper function to darken a color
  const darkenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.max(0, ((num >> 16) & 0xff) - amt);
    const g = Math.max(0, ((num >> 8) & 0xff) - amt);
    const b = Math.max(0, (num & 0xff) - amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="theme-button-wrapper"
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-sm bg-gradient-to-br from-background to-background/80"
                  aria-label="Color themes"
                >
                  <Palette className="h-5 w-5 text-primary/80" />
                </Button>
              </motion.div>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Color themes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Color Theme</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {Object.entries(themePresets).map(([key, { name, color }]) => (
            <div 
              key={key} 
              className={`flex flex-col items-center gap-2 cursor-pointer p-2 rounded-md transition-all
                ${activeColorTheme === key ? 'bg-primary/10 shadow-md' : 'hover:bg-primary/5'}`}
              onClick={() => changeColorTheme(key)}
            >
              <div 
                className="w-10 h-10 rounded-full transition-transform hover:scale-110" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium text-center">{name}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
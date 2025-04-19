import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Sun, Moon, Palette, Monitor } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [previousTheme, setPreviousTheme] = useState(theme);
  const [showIntroAnim, setShowIntroAnim] = useState(true);
  const [rotateDirection, setRotateDirection] = useState<number>(0);
  const [activeColorTheme, setActiveColorTheme] = useState("blue");
  
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
    
    // Toggle rotation direction - alternate between clockwise (360) and counterclockwise (-360)
    setRotateDirection(prev => (prev === 0 || prev === -360) ? 360 : -360);
    
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
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  // When directly clicking the button (not the dropdown part)
                  if (e.target === e.currentTarget || 
                      (e.target as HTMLElement).closest('.theme-icon-container')) {
                    e.preventDefault();
                    toggleTheme();
                  }
                }}
                className={`relative h-9 w-9 rounded-full transition-all 
                  hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10
                  hover:scale-110
                  ${showIntroAnim ? 'theme-button-attention' : ''}`}
                aria-label="Theme options"
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: rotateDirection, 
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    duration: 0.7, 
                    rotate: { 
                      type: 'spring', 
                      stiffness: 80,
                      damping: 15
                    },
                    scale: { times: [0, 0.5, 1] }
                  }}
                  className="relative theme-icon-container"
                >
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                  )}
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Theme settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4 text-gray-400" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Color Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={activeColorTheme} onValueChange={changeColorTheme}>
              {Object.entries(themePresets).map(([key, { name, color }]) => (
                <DropdownMenuRadioItem key={key} value={key} className="cursor-pointer">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    ></div>
                    {name}
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
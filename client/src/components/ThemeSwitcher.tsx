import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import {
  Sun,
  Moon,
  SunMoon,
  Palette,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const themes = [
  { 
    name: "light", 
    icon: Sun, 
    label: "Light",
    className: "bg-amber-50 text-amber-600 border border-amber-200"
  },
  { 
    name: "dark", 
    icon: Moon, 
    label: "Dark",
    className: "bg-zinc-900 text-blue-400 border border-zinc-700" 
  },
  { 
    name: "system", 
    icon: SunMoon, 
    label: "System",
    className: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white border border-sky-600"
  }
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [previousTheme, setPreviousTheme] = useState(theme);
  
  // Update selected theme when the theme changes externally
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  // Add transition effect to body when theme changes
  useEffect(() => {
    if (theme !== previousTheme) {
      // Get theme label
      const themeInfo = themes.find(t => t.name === theme) || themes[0];
      const Icon = themeInfo.icon;
      
      // Show toast notification
      toast({
        title: `Theme changed to ${themeInfo.label}`,
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

  const currentTheme = themes.find(t => t.name === selectedTheme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative h-9 w-9 rounded-full transition-all ${
                isOpen ? 
                  'bg-primary/10 shadow-lg shadow-primary/20' : 
                  'hover:shadow-md hover:shadow-primary/10'
              }`}
              aria-label="Toggle theme switcher"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <Palette className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Change appearance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{ zIndex: 50 }}
          >
            <div className="py-1 space-y-1">
              {themes.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex w-full items-center px-4 py-2 text-sm transition-all group
                    ${selectedTheme === item.name ? 
                    "bg-accent font-medium text-accent-foreground" : 
                    "text-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
                  onClick={() => {
                    setTheme(item.name as "light" | "dark" | "system");
                    setIsOpen(false);
                  }}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${item.className}
                    transition-transform group-hover:scale-110 ${selectedTheme === item.name ? "ring-2 ring-primary" : ""}`}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
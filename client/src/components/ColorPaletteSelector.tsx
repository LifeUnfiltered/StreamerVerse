import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Paintbrush, CheckCircle, Sun, Moon, Monitor, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';
import { useTheme } from './theme-provider';

// Default color palettes
const predefinedPalettes = {
  "Sunset": "#ff7e5f",
  "Ocean": "#0ea5e9",
  "Forest": "#059669",
  "Lavender": "#8b5cf6",
  "Rose": "#f43f5e",
  "Amber": "#f59e0b",
  "Slate": "#64748b",
  "Emerald": "#10b981"
};

// Interface for the theme types
interface ThemeConfig {
  primary: string;
  radius: number;
  variant: "professional" | "tint" | "vibrant";
  appearance: "light" | "dark" | "system";
}

interface ColorPaletteProps {
  onClose: () => void;
}

export default function ColorPaletteSelector({ onClose }: ColorPaletteProps) {
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState<string>("#0ea5e9"); // Default blue
  const [borderRadius, setBorderRadius] = useState<number>(0.5);
  const [themeVariant, setThemeVariant] = useState<"professional" | "tint" | "vibrant">("tint");
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");
  const [currentTab, setCurrentTab] = useState<string>("presets");
  
  // Load current theme on mount
  useEffect(() => {
    // Get current theme from localStorage or use default
    try {
      const themeData = localStorage.getItem("theme-config");
      if (themeData) {
        const parsedTheme = JSON.parse(themeData) as ThemeConfig;
        setPrimaryColor(parsedTheme.primary || "#0ea5e9");
        setBorderRadius(parsedTheme.radius || 0.5);
        setThemeVariant(parsedTheme.variant || "tint");
        setAppearance(parsedTheme.appearance || "system");
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }, []);
  
  const applyTheme = () => {
    const themeConfig: ThemeConfig = {
      primary: primaryColor,
      radius: borderRadius,
      variant: themeVariant,
      appearance: appearance
    };
    
    try {
      localStorage.setItem("theme-config", JSON.stringify(themeConfig));
      
      // This is where we would apply the theme to the app
      document.documentElement.style.setProperty('--theme-primary', primaryColor);
      document.documentElement.style.setProperty('--radius', `${borderRadius * 1}rem`);
      
      // Set the appearance (light/dark)
      if (appearance !== "system") {
        setTheme(appearance);
      } else {
        setTheme("system");
      }
      
      // Run confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Show success message
      toast({
        title: "Theme Updated!",
        description: "Your custom theme has been applied.",
        variant: "default",
      });
      
      // Close the palette selector
      setTimeout(onClose, 1000);
      
    } catch (error) {
      console.error("Failed to save theme:", error);
      toast({
        title: "Error",
        description: "Failed to save theme settings.",
        variant: "destructive",
      });
    }
  };

  const resetTheme = () => {
    // Reset to defaults
    setPrimaryColor("#0ea5e9");
    setBorderRadius(0.5);
    setThemeVariant("tint");
    setAppearance("system");
    
    toast({
      title: "Theme Reset",
      description: "Theme settings have been reset to defaults.",
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Personalize your streaming experience with custom colors and styles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Color Presets</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-4 pt-4">
            <div className="grid grid-cols-4 gap-2 mb-6">
              {Object.entries(predefinedPalettes).map(([name, color]) => (
                <div 
                  key={name}
                  className="flex flex-col items-center"
                >
                  <button
                    onClick={() => setPrimaryColor(color)}
                    className={`w-12 h-12 rounded-full transition-all hover:scale-110 ${
                      primaryColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  >
                    {primaryColor === color && (
                      <CheckCircle className="text-white h-6 w-6 mx-auto" />
                    )}
                  </button>
                  <span className="text-xs mt-1">{name}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Border Roundness</label>
                <Slider
                  value={[borderRadius]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(values) => setBorderRadius(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Square</span>
                  <span>Round</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Style Variant</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={themeVariant === "professional" ? "default" : "outline"}
                    onClick={() => setThemeVariant("professional")}
                    className="h-auto py-2"
                  >
                    Professional
                  </Button>
                  <Button
                    variant={themeVariant === "tint" ? "default" : "outline"}
                    onClick={() => setThemeVariant("tint")}
                    className="h-auto py-2"
                  >
                    Tint
                  </Button>
                  <Button
                    variant={themeVariant === "vibrant" ? "default" : "outline"}
                    onClick={() => setThemeVariant("vibrant")}
                    className="h-auto py-2"
                  >
                    Vibrant
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Appearance</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={appearance === "light" ? "default" : "outline"}
                    onClick={() => setAppearance("light")}
                    className="flex flex-col h-auto py-2"
                  >
                    <Sun className="h-4 w-4 mb-1" />
                    Light
                  </Button>
                  <Button
                    variant={appearance === "dark" ? "default" : "outline"}
                    onClick={() => setAppearance("dark")}
                    className="flex flex-col h-auto py-2"
                  >
                    <Moon className="h-4 w-4 mb-1" />
                    Dark
                  </Button>
                  <Button
                    variant={appearance === "system" ? "default" : "outline"}
                    onClick={() => setAppearance("system")}
                    className="flex flex-col h-auto py-2"
                  >
                    <Monitor className="h-4 w-4 mb-1" />
                    System
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 border rounded-lg bg-background/50">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div 
            className="h-16 rounded-md flex items-center justify-center"
            style={{ 
              backgroundColor: primaryColor,
              borderRadius: `${borderRadius * 0.5}rem`
            }}
          >
            <span className="text-white font-semibold">Theme Preview</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetTheme} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={applyTheme}>
            Apply Theme
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
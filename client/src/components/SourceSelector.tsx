import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiYoutube, SiHbo, SiNetflix, SiPrimevideo, SiApple } from "react-icons/si";
import { Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SourceSelectorProps {
  onSourceSelect: (source: 'youtube' | 'vidsrc') => void;
  currentSource: 'youtube' | 'vidsrc';
}

export default function SourceSelector({ onSourceSelect, currentSource }: SourceSelectorProps) {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentSource === 'youtube' ? 'default' : 'outline'}
              className="flex-1 flex items-center gap-2 min-w-[120px]"
              onClick={() => onSourceSelect('youtube')}
            >
              <SiYoutube className="h-5 w-5 text-red-600" />
              <span>YouTube</span>
            </Button>
            <Button
              variant={currentSource === 'vidsrc' ? 'default' : 'outline'}
              className="flex-1 flex items-center gap-2 min-w-[120px]"
              onClick={() => onSourceSelect('vidsrc')}
            >
              <Play className="h-5 w-5" />
              <span>VidSrc</span>
            </Button>

            {/* Future streaming platforms - currently disabled */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center gap-2 min-w-[120px]" disabled>
                  <SiNetflix className="h-5 w-5 text-red-600" />
                  <span>Netflix</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center gap-2 min-w-[120px]" disabled>
                  <SiPrimevideo className="h-5 w-5 text-blue-500" />
                  <span>Prime</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center gap-2 min-w-[120px]" disabled>
                  <SiApple className="h-5 w-5 text-gray-500" />
                  <span>Apple TV+</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center gap-2 min-w-[120px]" disabled>
                  <SiHbo className="h-5 w-5 text-purple-500" />
                  <span>HBO Max</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
import type { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Heart, Share2, Eye, Clock, Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import WatchlistButton from "./WatchlistButton";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isSelected: boolean;
  onAuthRequired: () => void;
  variant?: 'default' | 'compact';
}

export default function VideoCard({ 
  video, 
  onClick, 
  isSelected,
  onAuthRequired,
  variant = 'default'
}: VideoCardProps) {
  const isCompact = variant === 'compact';
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getSourceGradient = (source: string) => {
    switch (source) {
      case 'youtube': return 'from-red-500 to-red-600';
      case 'vidsrc': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getQualityBadge = () => {
    const qualities = ['4K', 'HD', 'FHD'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  };

  if (isCompact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 ease-in-out",
            "hover:shadow-lg hover:shadow-primary/20 border-border/50 hover:border-primary/30",
            "bg-gradient-to-br from-card to-card/80",
            isSelected && "ring-2 ring-primary shadow-lg shadow-primary/30"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-3">
            <div className="flex space-x-3">
              <div className="relative flex-shrink-0 group">
                <div className="w-28 h-18 rounded-lg overflow-hidden">
                  <img 
                    src={video.thumbnail || ''} 
                    alt={video.title}
                    className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <Badge className={`absolute top-1 left-1 text-xs bg-gradient-to-r ${getSourceGradient(video.source)} text-white shadow-lg`}>
                  {video.source.toUpperCase()}
                </Badge>
                <Badge className="absolute bottom-1 right-1 text-xs bg-black/80 text-white">
                  {getQualityBadge()}
                </Badge>
              </div>
              <div className="flex-1 min-w-0" onClick={onClick}>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                  {video.title}
                </h3>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {video.source === 'vidsrc' && video.metadata?.contentRating && (
                    <Badge variant="outline" className="text-xs">
                      {video.metadata.contentRating}
                    </Badge>
                  )}
                  {video.source === 'vidsrc' && video.metadata?.voteAverage && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {video.metadata.voteAverage.toFixed(1)}
                    </Badge>
                  )}
                  {video.source === 'youtube' && (
                    <Badge variant="outline" className="text-xs border-red-500/30 text-red-500">
                      YouTube
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    {video.source === 'youtube' && video.metadata?.channelTitle && (
                      <span className="text-xs text-muted-foreground">
                        {video.metadata.channelTitle}
                      </span>
                    )}
                    {video.source === 'vidsrc' && video.metadata?.releaseDate && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.metadata.releaseDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <WatchlistButton 
                    video={video} 
                    onAuthRequired={onAuthRequired}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-500 ease-out overflow-hidden",
          "hover:shadow-2xl hover:shadow-primary/20 border-border/50 hover:border-primary/40",
          "bg-gradient-to-br from-card to-card/90",
          isSelected && "ring-2 ring-primary shadow-xl shadow-primary/30"
        )}
      >
        <CardContent className="p-0 overflow-hidden">
          <div className="relative">
            <div className="aspect-video relative overflow-hidden">
              <img
                src={video.thumbnail || ''}
                alt={video.title}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
              
              {/* Full Card Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              {/* Central Play Button */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  size="lg" 
                  onClick={onClick}
                  className="rounded-full bg-white/95 hover:bg-white text-black shadow-2xl backdrop-blur-sm border-2 border-white/20 hover:scale-110 transition-all duration-300"
                >
                  <Play className="h-7 w-7 ml-1" />
                </Button>
              </motion.div>
              
              {/* Enhanced Source Badge */}
              <Badge className={`absolute top-3 left-3 bg-gradient-to-r ${getSourceGradient(video.source)} text-white shadow-lg backdrop-blur-sm font-semibold`}>
                {video.source.toUpperCase()}
              </Badge>
              
              {/* Quality Badge */}
              <Badge className="absolute top-3 right-3 bg-black/80 text-white backdrop-blur-sm shadow-lg">
                {getQualityBadge()}
              </Badge>
              
              {/* Duration */}
              {video.metadata?.runtime && (
                <Badge className="absolute bottom-3 right-3 bg-black/90 text-white backdrop-blur-sm shadow-lg">
                  {video.metadata.runtime}m
                </Badge>
              )}
              
              {/* Quick Actions Bar */}
              <motion.div 
                className="absolute bottom-3 left-3 flex space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
                </Button>
                
                <div onClick={e => e.stopPropagation()}>
                  <WatchlistButton 
                    video={video} 
                    onAuthRequired={onAuthRequired}
                  />
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4 text-gray-700" />
                </Button>
              </motion.div>
            </div>
            
            {/* Enhanced Content Section */}
            <div className="p-5 bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 cursor-pointer" onClick={onClick}>
                  {video.title}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {video.source === 'youtube' && video.metadata?.channelTitle && (
                    <span className="font-medium">{video.metadata.channelTitle}</span>
                  )}
                  {video.source === 'vidsrc' && video.metadata?.releaseDate && (
                    <span className="font-medium">{new Date(video.metadata.releaseDate).getFullYear()}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {video.metadata?.voteAverage && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{video.metadata.voteAverage.toFixed(1)}</span>
                    </div>
                  )}
                  <Badge className={`text-xs ${getSourceGradient(video.source)} text-white`}>
                    {video.source.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {/* Metadata badges */}
              <div className="flex gap-2 mt-3">
                {video.metadata?.contentRating && (
                  <Badge variant="outline" className="text-xs">
                    {video.metadata.contentRating}
                  </Badge>
                )}
                {video.metadata?.type === 'movie' && video.metadata.releaseDate && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(video.metadata.releaseDate).getFullYear()}
                  </Badge>
                )}
                {video.metadata?.type === 'tv' && video.metadata.firstAirDate && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(video.metadata.firstAirDate).getFullYear()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
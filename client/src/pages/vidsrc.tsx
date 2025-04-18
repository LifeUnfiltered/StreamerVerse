import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthDialog from "@/components/AuthDialog";
import SearchBar from "@/components/SearchBar";
import ShowDetails from "@/components/ShowDetails";
import SourceSelector from "@/components/SourceSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Sword, 
  Plane, 
  Heart, 
  Laugh, 
  Ghost, 
  Rocket, 
  Film, 
  Tv, 
  Skull, 
  Music, 
  Castle, 
  Umbrella, 
  FlaskConical,
  Bomb,
  Baby,
  Users,
  Search,
  Camera,
  History,
  Zap
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface NavigationState {
  view: 'browse' | 'search' | 'watchlist' | 'video' | 'trending';
  previousView: 'browse' | 'search' | 'watchlist' | 'video' | 'trending' | null;
}

interface GenreItem {
  id: number;
  name: string;
}

export default function VidSrc() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSource, setCurrentSource] = useState<'youtube' | 'vidsrc'>('vidsrc');
  const [navigation, setNavigation] = useState<NavigationState>({ 
    view: 'browse',
    previousView: null 
  });
  const queryClient = useQueryClient();

  // Watchlist query
  const { data: watchlist } = useQuery<Video[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/watchlist');
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch watchlist');
        }
        return response.json();
      } catch (error) {
        console.error('Watchlist error:', error);
        throw error;
      }
    },
    retry: false
  });

  // Latest content queries
  const { data: movies, isLoading: moviesLoading, error: moviesError } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/movies', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/movies?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery && currentSource === 'vidsrc' && navigation.view === 'browse'
  });

  const { data: shows, isLoading: showsLoading, error: showsError } = useQuery<Video[]>({
    queryKey: ['/api/videos/test-tv'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/test-tv');
      const shows = await response.json();
      
      // Cache the show titles for future reference
      shows.forEach((show: Video) => {
        if (show.metadata?.type === 'tv') {
          const showId = show.metadata?.imdbId || show.sourceId;
          if (showId && show.title) {
            showNameCache.set(showId, show.title);
            console.log(`Cached show title from browse: ${showId} = "${show.title}"`);
          }
        }
      });
      
      return shows;
    },
    enabled: !searchQuery && currentSource === 'vidsrc' && navigation.view === 'browse'
  });

  const { data: episodes } = useQuery<Video[]>({
    queryKey: ['/api/videos/vidsrc/latest/episodes', page],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/videos/vidsrc/latest/episodes?page=${page}`);
      return response.json();
    },
    enabled: !searchQuery && !!selectedVideo && currentSource === 'vidsrc'
  });

  // Search query
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery<Video[]>({
    queryKey: [currentSource === 'youtube' ? '/api/videos/search' : '/api/videos/vidsrc/search', searchQuery, currentSource],
    queryFn: async () => {
      const endpoint = currentSource === 'youtube'
        ? `/api/videos/search?query=${encodeURIComponent(searchQuery)}&source=youtube`
        : `/api/videos/vidsrc/search?query=${encodeURIComponent(searchQuery)}`;
      const response = await apiRequest('GET', endpoint);
      const results = await response.json();
      
      // Process results to cache metadata
      if (currentSource === 'vidsrc') {
        results.forEach((video: Video) => {
          // For TV shows, cache the title
          if (video.metadata?.type === 'tv' && !video.metadata?.season) {
            const showId = video.metadata?.imdbId || video.sourceId;
            if (showId && video.title) {
              showNameCache.set(showId, video.title);
              console.log(`Cached show title from search: ${showId} = "${video.title}"`);
            }
          }
          
          // For TV episodes, cache title and description
          if (video.metadata?.type === 'tv' && video.metadata?.season && video.metadata?.episode) {
            const showId = video.metadata?.imdbId || video.sourceId?.split('-')[0];
            const season = video.metadata.season;
            const episodeNum = video.metadata.episode;
            
            // Cache the episode description if available
            if (video.description) {
              const cacheKey = getEpisodeKey(showId, season, episodeNum);
              episodeDescriptionCache.set(cacheKey, video.description);
              console.log(`Cached episode description from search: ${cacheKey}`);
            }
            
            // Extract and cache episode title if it follows our format
            if (video.title && video.title.includes(' - ')) {
              const titleParts = video.title.split(' - ');
              if (titleParts.length > 1) {
                const episodeTitle = titleParts[1];
                const cacheKey = getEpisodeKey(showId, season, episodeNum);
                episodeTitleCache.set(cacheKey, episodeTitle);
                console.log(`Cached episode title from search: ${cacheKey} = "${episodeTitle}"`);
              }
            }
          }
        });
      }
      
      return results;
    },
    enabled: searchQuery.length > 0
  });

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
    setSelectedVideo(null);
    
    // Keep the searchQuery in the navigation state, but update the view
    setNavigation({ 
      view: 'search', 
      previousView: navigation.view === 'search' ? navigation.previousView : navigation.view 
    });
  };

  const handleSourceSelect = (source: 'youtube' | 'vidsrc') => {
    setCurrentSource(source);
    setSelectedVideo(null);
    setSearchQuery('');
    setNavigation({ view: 'browse', previousView: null });
  };

  const handleAuthSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
  };

  const handleWatchlistClick = () => {
    setNavigation({ 
      view: 'watchlist',
      previousView: navigation.view === 'watchlist' ? navigation.previousView : navigation.view
    });
    setSearchQuery('');
  };
  
  // Handle navigation to trending content
  const handleTrendingClick = () => {
    setNavigation({ 
      view: 'trending',
      previousView: navigation.view === 'trending' ? navigation.previousView : navigation.view
    });
    setSearchQuery('');
    setSelectedVideo(null);
  };
  
  // Handle genre selection
  const handleGenreSelect = (genreId: number, type: 'movies' | 'tv') => {
    setSelectedGenreId(genreId);
    setSelectedGenreType(type);
    setSearchQuery('');
    setSelectedVideo(null);
  };

  const handleVideoSelect = (video: Video) => {
    // Apply cached episode title if available for selected episode
    let updatedVideo = { ...video };
    
    // Find a complete version of the video to preserve all metadata
    let completeVideo = null;
    
    // Print current video selection information for debugging
    console.log('Selected video:', video.title, 'with metadata:', video.metadata);
    
    // For TV episodes, search in the episodes array
    if (video.metadata?.type === 'tv' && video.metadata?.season && video.metadata?.episode) {
      const showId = video.metadata?.imdbId || video.sourceId?.split('-')[0];
      const season = video.metadata.season;
      const episodeNum = video.metadata.episode;
      
      // Calculate the cache key for this episode
      const cacheKey = getEpisodeKey(showId, season, episodeNum);
      
      console.log('Current episode:', updatedVideo.title);
      
      // First try to find this episode in the showEpisodes array to get complete metadata
      completeVideo = showEpisodes.find(ep => 
        ep.id === video.id || 
        (ep.sourceId === video.sourceId && 
         ep.metadata?.season === video.metadata?.season && 
         ep.metadata?.episode === video.metadata?.episode)
      );
      
      // If found in episodes, use that instead but keep current values we want to preserve
      if (completeVideo) {
        console.log('Found complete episode in episodes list with all metadata:', completeVideo);
        updatedVideo = {
          ...completeVideo,
          // Preserve the updated title if needed
          title: updatedVideo.title !== video.title ? updatedVideo.title : completeVideo.title,
          // CRITICAL: Make sure to preserve metadata values from both current selection and complete data
          metadata: {
            ...completeVideo.metadata,
            ...updatedVideo.metadata,
            // Explicitly preserve runtime and content rating
            runtime: completeVideo.metadata?.runtime || updatedVideo.metadata?.runtime,
            contentRating: completeVideo.metadata?.contentRating || updatedVideo.metadata?.contentRating
          }
        };
        
        // Store the description in the cache
        if (updatedVideo.description) {
          episodeDescriptionCache.set(cacheKey, updatedVideo.description);
          console.log(`Caching episode description: ${cacheKey} = "${updatedVideo.description}"`);
        }
      }
      
      // If we have a cached description but the video doesn't have one, apply it
      const cachedDescription = episodeDescriptionCache.get(cacheKey);
      if (cachedDescription && (!updatedVideo.description || updatedVideo.description === '')) {
        console.log(`Applying cached description to episode: ${cacheKey}`);
        updatedVideo.description = cachedDescription;
      }
      
      // Check if this episode has a cached title
      if (showId) {
        const cacheKey = getEpisodeKey(showId, season, episodeNum);
        const cachedTitle = episodeTitleCache.get(cacheKey);
        
        // Get the actual show name from cache or current show
        let showTitle = '';
        
        // First try to get the show name from our cache
        if (showNameCache.has(showId)) {
          showTitle = showNameCache.get(showId) || '';
          console.log(`Using cached show title: ${showId} = "${showTitle}"`);
        } 
        // Otherwise try to get it from the current show
        else if (currentShow?.title) {
          showTitle = currentShow.title;
          
          // Cache this show name for future reference
          showNameCache.set(showId, showTitle);
          console.log(`Caching show title from current show: ${showId} = "${showTitle}"`);
        }
        // Try to extract it from the episode title if it has a pattern "ShowName S1E1"
        else if (video.title && video.title.includes(`S${season}E${episodeNum}`)) {
          const titleParts = video.title.split(`S${season}E${episodeNum}`);
          if (titleParts.length > 0) {
            showTitle = titleParts[0].trim();
            
            // Cache this extracted show name
            if (showTitle && showTitle !== 'Show') {
              showNameCache.set(showId, showTitle);
              console.log(`Caching extracted show title: ${showId} = "${showTitle}"`);
            }
          }
        }
        
        // Default to a generic show title if we couldn't find one
        if (!showTitle) {
          showTitle = 'Show';
        }
        
        // If we have a cached episode title
        if (cachedTitle) {
          // Create a formatted title
          const newTitle = formatEpisodeTitle(showTitle, season, episodeNum, cachedTitle);
          console.log(`Applying cached episode title: "${updatedVideo.title}" → "${newTitle}"`);
          
          // Update the video with the formatted title
          updatedVideo.title = newTitle;
          
          // Check if we have a cached description for this episode
          const cachedDescription = episodeDescriptionCache.get(cacheKey);
          if (cachedDescription) {
            console.log(`Applying cached episode description for ${cacheKey}`);
            updatedVideo.description = cachedDescription;
          }
        } 
        // If we don't have a cached title but the video has one in the proper format, cache it
        else if (updatedVideo.title && updatedVideo.title.includes(' - ')) {
          const titleParts = updatedVideo.title.split(' - ');
          if (titleParts.length > 1) {
            const extractedTitle = titleParts[1];
            episodeTitleCache.set(cacheKey, extractedTitle);
            console.log(`Caching title from selected video: ${cacheKey} = "${extractedTitle}"`);
            
            // Update the title with proper show name
            const newTitle = formatEpisodeTitle(showTitle, season, episodeNum, extractedTitle);
            updatedVideo.title = newTitle;
          }
        }
        // If we have a generic title, try to apply a better format
        else if (updatedVideo.title && updatedVideo.title.includes('Season') && updatedVideo.title.includes('Episode')) {
          // Create a better formatted title (without episode title)
          const newTitle = formatEpisodeTitle(showTitle, season, episodeNum);
          console.log(`Formatting generic title: "${updatedVideo.title}" → "${newTitle}"`);
          updatedVideo.title = newTitle;
        }
      }
    } 
    // For TV shows, search in the shows array
    else if (video.metadata?.type === 'tv') {
      completeVideo = shows?.find(show => 
        show.id === video.id || 
        show.sourceId === video.sourceId || 
        show.metadata?.imdbId === video.metadata?.imdbId
      );
      
      if (completeVideo) {
        console.log('Found complete show in shows list with all metadata:', completeVideo);
        updatedVideo = {
          ...completeVideo,
          // Make sure to keep original metadata values
          metadata: {
            ...completeVideo.metadata,
            ...updatedVideo.metadata,
            // Explicitly ensure runtime is preserved 
            runtime: completeVideo.metadata?.runtime || updatedVideo.metadata?.runtime,
            contentRating: completeVideo.metadata?.contentRating || updatedVideo.metadata?.contentRating
          }
        };
      }
    }
    
    // Update the selected video
    setSelectedVideo(updatedVideo);
    setNavigation({ 
      view: 'video',
      previousView: navigation.view
    });
  };

  const handleBack = useCallback(() => {
    if (!navigation.previousView) {
      setNavigation({ view: 'browse', previousView: null });
      setSelectedVideo(null);
      setSearchQuery('');
      return;
    }

    setNavigation({ 
      view: navigation.previousView,
      previousView: null
    });

    if (navigation.previousView === 'browse') {
      setSelectedVideo(null);
      setSearchQuery('');
    }
  }, [navigation]);

  const isLoggedIn = watchlist !== null;

  // Determine if the selected video is a TV show episode or a TV show
  const isSelectedVideoTVShow = selectedVideo && 
    (selectedVideo.metadata?.type === 'tv');
  
  const isSelectedVideoTVEpisode = selectedVideo && 
    (selectedVideo.metadata?.season && selectedVideo.metadata?.episode);
    
  // Store the parent show ID if it's an episode
  const parentShowId = selectedVideo?.metadata?.imdbId;
  
  // Find the proper show object - either:
  // 1. The selected video is the show itself
  // 2. We need to find the parent show for an episode
  // 3. We'll look in the shows array by ID or sourceId
  // 4. We'll look by sourceId pattern (show ID might be part of episode sourceId)
  
  // First try direct show selection or ID matching
  let foundShow = (isSelectedVideoTVShow && !isSelectedVideoTVEpisode) ? selectedVideo : 
    (parentShowId && shows?.find(show => 
      show.sourceId === parentShowId || 
      show.metadata?.imdbId === parentShowId
    )) || 
    (selectedVideo && shows?.find(show =>
      show.sourceId === selectedVideo.sourceId || 
      show.metadata?.imdbId === selectedVideo.sourceId
    ));
  
  // If we still don't have a show but have a TV episode, try to extract the show ID from sourceId
  if (!foundShow && isSelectedVideoTVEpisode && selectedVideo?.sourceId) {
    // sourceId might be in format "showID-s1e1"
    const parts = selectedVideo.sourceId.split('-');
    if (parts.length > 0) {
      const extractedShowId = parts[0];
      console.log(`Trying to find show with extracted ID: ${extractedShowId}`);
      
      // Look for a show with this ID
      foundShow = shows?.find(show => 
        show.sourceId === extractedShowId || 
        show.metadata?.imdbId === extractedShowId
      );
      
      if (foundShow) {
        console.log(`Found show using extracted ID: ${foundShow.title}`);
      }
    }
  }
  
  const currentShow = foundShow;
  
  // Determine what show ID to use for fetching episodes
  // We need to handle both episodes and shows
  let episodeFetchId: string | number | null = null;
  
  // If we have a current show, use its ID or sourceId
  if (currentShow) {
    episodeFetchId = currentShow.id || currentShow.sourceId;
  }
  // If we don't have a current show but have a selected TV episode,
  // try to extract the show ID from the episode
  else if (isSelectedVideoTVEpisode) {
    // Try multiple methods to get the show ID
    if (selectedVideo?.metadata?.imdbId) {
      // Option 1: Use the episode's IMDB ID directly if available
      episodeFetchId = selectedVideo.metadata.imdbId;
    } else if (selectedVideo?.sourceId) {
      // Option 2: Try to extract from sourceId which might be formatted like "showID-s1e1"
      const sourceIdParts = selectedVideo.sourceId.split('-');
      if (sourceIdParts.length > 0) {
        // Use the first part of sourceId as the show ID
        episodeFetchId = sourceIdParts[0];
        console.log(`Extracted show ID from sourceId: ${episodeFetchId}`);
      }
    }
    // Option 3: Try to extract TMDB ID if available
    else if (selectedVideo?.metadata?.tmdbId) {
      episodeFetchId = selectedVideo.metadata.tmdbId;
    }
  }
  
  // Log for debugging
  console.log('Episode fetch ID:', episodeFetchId);
  console.log('Current show:', currentShow);
  console.log('Selected video:', selectedVideo);
  
  // Helper function to format episode titles consistently
  const formatEpisodeTitle = (showTitle: string, season: number, episode: number, episodeTitle: string = '') => {
    const seasonEpisodeText = `S${season}E${episode}`;
    if (episodeTitle) {
      return `${showTitle} ${seasonEpisodeText} - ${episodeTitle}`;
    } else {
      return `${showTitle} ${seasonEpisodeText}`;
    }
  };

  // Maintain a cache of episode titles
  const episodeTitleCache = useMemo(() => new Map<string, string>(), []);
  
  // Maintain a cache of episode descriptions
  const episodeDescriptionCache = useMemo(() => new Map<string, string>(), []);

  // Function to get a key for the episode cache
  const getEpisodeKey = (showId: string, season: number, episode: number) => {
    return `${showId}-s${season}e${episode}`;
  };
  
  // Store show names in a cache for reference
  const showNameCache = useMemo(() => new Map<string, string>(), []);
  
  // Helper function to get genre icons
  const getGenreIcon = (genreId: number, type: 'movies' | 'tv') => {
    // Movie genre IDs
    if (type === 'movies') {
      switch (genreId) {
        case 28: return <Sword className="h-5 w-5 mb-1" />; // Action
        case 12: return <Plane className="h-5 w-5 mb-1" />; // Adventure
        case 16: return <Baby className="h-5 w-5 mb-1" />; // Animation
        case 35: return <Laugh className="h-5 w-5 mb-1" />; // Comedy
        case 80: return <Search className="h-5 w-5 mb-1" />; // Crime
        case 99: return <Camera className="h-5 w-5 mb-1" />; // Documentary
        case 18: return <Heart className="h-5 w-5 mb-1" />; // Drama
        case 10751: return <Users className="h-5 w-5 mb-1" />; // Family
        case 14: return <Castle className="h-5 w-5 mb-1" />; // Fantasy
        case 36: return <History className="h-5 w-5 mb-1" />; // History
        case 27: return <Ghost className="h-5 w-5 mb-1" />; // Horror
        case 10402: return <Music className="h-5 w-5 mb-1" />; // Music
        case 9648: return <Search className="h-5 w-5 mb-1" />; // Mystery
        case 10749: return <Heart className="h-5 w-5 mb-1" />; // Romance
        case 878: return <Rocket className="h-5 w-5 mb-1" />; // Science Fiction
        case 53: return <Bomb className="h-5 w-5 mb-1" />; // Thriller
        case 10752: return <Sword className="h-5 w-5 mb-1" />; // War
        case 37: return <Film className="h-5 w-5 mb-1" />; // Western
        default: return <Film className="h-5 w-5 mb-1" />;
      }
    }
    // TV genre IDs
    else {
      switch (genreId) {
        case 10759: return <Plane className="h-5 w-5 mb-1" />; // Action & Adventure
        case 16: return <Baby className="h-5 w-5 mb-1" />; // Animation
        case 35: return <Laugh className="h-5 w-5 mb-1" />; // Comedy
        case 80: return <Search className="h-5 w-5 mb-1" />; // Crime
        case 99: return <Camera className="h-5 w-5 mb-1" />; // Documentary
        case 18: return <Heart className="h-5 w-5 mb-1" />; // Drama
        case 10751: return <Users className="h-5 w-5 mb-1" />; // Family
        case 10762: return <Baby className="h-5 w-5 mb-1" />; // Kids
        case 9648: return <Search className="h-5 w-5 mb-1" />; // Mystery
        case 10763: return <Film className="h-5 w-5 mb-1" />; // News
        case 10764: return <Tv className="h-5 w-5 mb-1" />; // Reality
        case 10765: return <Rocket className="h-5 w-5 mb-1" />; // Sci-Fi & Fantasy
        case 10766: return <Heart className="h-5 w-5 mb-1" />; // Soap
        case 10767: return <Film className="h-5 w-5 mb-1" />; // Talk
        case 10768: return <Sword className="h-5 w-5 mb-1" />; // War & Politics
        case 37: return <Film className="h-5 w-5 mb-1" />; // Western
        default: return <Tv className="h-5 w-5 mb-1" />;
      }
    }
  };
  
  // State for selected genre
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedGenreType, setSelectedGenreType] = useState<'movies' | 'tv'>('movies');
  
  // Fetch movie genres
  const { data: movieGenres } = useQuery<GenreItem[]>({
    queryKey: ['/api/genres/movies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/genres/movies');
      return response.json();
    },
    enabled: currentSource === 'vidsrc' && navigation.view === 'browse'
  });
  
  // Fetch TV genres
  const { data: tvGenres } = useQuery<GenreItem[]>({
    queryKey: ['/api/genres/tv'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/genres/tv');
      return response.json();
    },
    enabled: currentSource === 'vidsrc' && navigation.view === 'browse'
  });
  
  // Fetch trending content
  const { data: trendingContent, isLoading: trendingLoading, error: trendingError } = useQuery<Video[]>({
    queryKey: ['/api/videos/trending', page],
    queryFn: async () => {
      const timeWindow = 'week'; // Default to weekly trending
      const response = await apiRequest('GET', `/api/videos/trending?time_window=${timeWindow}&page=${page}`);
      const content = await response.json();
      
      // Cache show titles for TV shows
      content.forEach((video: Video) => {
        if (video.metadata?.type === 'tv') {
          const showId = video.metadata?.imdbId || video.sourceId;
          if (showId && video.title) {
            showNameCache.set(showId, video.title);
            console.log(`Cached trending show title: ${showId} = "${video.title}"`);
          }
        }
      });
      
      return content;
    },
    enabled: currentSource === 'vidsrc' && navigation.view === 'trending'
  });
  
  // Fetch movies by genre
  const { data: genreMovies, isLoading: genreMoviesLoading, error: genreMoviesError } = useQuery<Video[]>({
    queryKey: ['/api/videos/movies/genre', selectedGenreId, page],
    queryFn: async () => {
      if (!selectedGenreId) return [];
      const response = await apiRequest('GET', `/api/videos/movies/genre/${selectedGenreId}?page=${page}`);
      return response.json();
    },
    enabled: currentSource === 'vidsrc' && selectedGenreType === 'movies' && selectedGenreId !== null
  });
  
  // Fetch TV shows by genre
  const { data: genreTVShows, isLoading: genreTVShowsLoading, error: genreTVShowsError } = useQuery<Video[]>({
    queryKey: ['/api/videos/tv/genre', selectedGenreId, page],
    queryFn: async () => {
      if (!selectedGenreId) return [];
      const response = await apiRequest('GET', `/api/videos/tv/genre/${selectedGenreId}?page=${page}`);
      return response.json();
    },
    enabled: currentSource === 'vidsrc' && selectedGenreType === 'tv' && selectedGenreId !== null
  });

  // Fetch episodes when a show is selected
  const { data: showEpisodes = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos/tv', episodeFetchId, '/episodes'],
    queryFn: async () => {
      if (!episodeFetchId) return [];
      
      console.log('Fetching episode data from API for show ID:', episodeFetchId);
      
      // Use ID or sourceId depending on what's available
      const response = await apiRequest('GET', `/api/videos/tv/${episodeFetchId}/episodes`);
      const episodes = await response.json();

      // Get the show ID and show title for this episode list
      let showTitle = 'Unknown Show';
      let showId = '';
      
      // IMPORTANT: If we already have a selected episode with metadata, preserve it in the 
      // episode list to ensure consistent metadata between episodes
      if (selectedVideo?.metadata?.type === 'tv' && 
          selectedVideo?.metadata?.season && 
          selectedVideo?.metadata?.episode) {
        
        // Find if this episode exists in the list
        const existingEpisodeIndex = episodes.findIndex((ep: Video) => 
          (ep.metadata?.season === selectedVideo.metadata?.season && 
           ep.metadata?.episode === selectedVideo.metadata?.episode) ||
          ep.sourceId === selectedVideo.sourceId ||
          ep.id === selectedVideo.id
        );
        
        // If found, update with our selected metadata to preserve descriptions
        if (existingEpisodeIndex >= 0) {
          // Merge the existing episode with our selected one, prioritizing our selected one's metadata
          episodes[existingEpisodeIndex] = {
            ...episodes[existingEpisodeIndex],
            description: selectedVideo.description || episodes[existingEpisodeIndex].description,
            title: selectedVideo.title || episodes[existingEpisodeIndex].title,
            thumbnail: selectedVideo.thumbnail || episodes[existingEpisodeIndex].thumbnail,
            // Make sure to preserve important metadata like runtime and content rating
            metadata: {
              ...episodes[existingEpisodeIndex].metadata,
              ...selectedVideo.metadata,
              // Explicitly set runtime to make sure it's preserved
              runtime: selectedVideo.metadata?.runtime || episodes[existingEpisodeIndex].metadata?.runtime,
              contentRating: selectedVideo.metadata?.contentRating || episodes[existingEpisodeIndex].metadata?.contentRating
            }
          };
          
          console.log('Updated episode in the list to preserve metadata:', episodes[existingEpisodeIndex]);
        }
      }
      
      // If we have a current show object, use its information
      if (currentShow) {
        showTitle = currentShow.title || 'Unknown Show';
        showId = currentShow.metadata?.imdbId || currentShow.sourceId;
        
        // Cache the show title if we don't have it already
        if (showId && !showNameCache.has(showId)) {
          showNameCache.set(showId, showTitle);
          console.log(`Caching show title during episodes fetch: ${showId} = "${showTitle}"`);
        }
      } 
      // Otherwise try to extract show ID from episodeFetchId
      else if (episodeFetchId && typeof episodeFetchId === 'string') {
        // This might be an imdbId directly
        showId = episodeFetchId;
        
        // Check if we have this show in our cache
        if (showNameCache.has(showId)) {
          showTitle = showNameCache.get(showId) || 'Unknown Show';
          console.log(`Using cached show title for episodes: ${showId} = "${showTitle}"`);
        }
      }
      
      // Process each episode to extract titles and update their format
      const processedEpisodes = episodes.map((episode: Video) => {
        if (episode.metadata?.season && episode.metadata?.episode) {
          const season = episode.metadata.season;
          const episodeNum = episode.metadata.episode;
          
          // Get the episode's show ID, which might be different from the main show ID
          const episodeShowId = episode.metadata?.imdbId || episode.sourceId?.split('-')[0] || showId;
          
          // Check if we have a cached show name for this specific episode
          let episodeShowTitle = showTitle;
          if (episodeShowId && showNameCache.has(episodeShowId)) {
            episodeShowTitle = showNameCache.get(episodeShowId) || showTitle;
          }
          
          // Extract episode title if it has one
          const titleParts = episode.title?.split(' - ');
          let episodeTitle = '';
          
          if (titleParts && titleParts.length > 1) {
            episodeTitle = titleParts[1];
            const cacheKey = getEpisodeKey(episodeShowId, season, episodeNum);
            episodeTitleCache.set(cacheKey, episodeTitle);
            console.log(`Cached episode title from API: ${cacheKey} = "${episodeTitle}"`);
          }
          
          // Format the title consistently across all episodes
          // Regardless of whether it's a generic title or already has custom formatting
          const newTitle = formatEpisodeTitle(episodeShowTitle, season, episodeNum, episodeTitle);
          
          if (episode.title !== newTitle) {
            console.log(`Reformatting episode title: "${episode.title}" → "${newTitle}"`);
          }
          
          // Cache the episode description if it's not a generic one
          if (episode.description && 
              !episode.description.startsWith('Season ') && 
              !episode.description.startsWith(`S${season}E`)) {
            const cacheKey = getEpisodeKey(episodeShowId, season, episodeNum);
            episodeDescriptionCache.set(cacheKey, episode.description);
            console.log(`Cached episode description from API: ${cacheKey} = "${episode.description}"`);
          }
          
          // Return a new episode object with the updated title
          // Make sure we also preserve runtime and content rating data
          return {
            ...episode,
            title: newTitle,
            metadata: {
              ...episode.metadata,
              // Ensure runtime, contentRating and any other important metadata is preserved
              runtime: episode.metadata?.runtime || null,
              contentRating: episode.metadata?.contentRating || null
            }
          };
        }
        
        // Return the original episode if no changes needed
        return episode;
      });
      
      return processedEpisodes;
    },
    enabled: !!episodeFetchId && currentSource === 'vidsrc' && (navigation.view === 'video' || selectedVideo?.metadata?.type === 'tv')
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAuthClick={() => setIsAuthDialogOpen(true)}
        onWatchlistClick={handleWatchlistClick}
        onTrendingClick={handleTrendingClick}
      />
      <main className="container mx-auto p-4 md:p-6">
        <div className="space-y-4">
          {navigation.view !== 'browse' && (
            <div className="flex items-center justify-between">
              <BackButton onClick={handleBack} />
              <h2 className="text-xl font-semibold">
                {navigation.view === 'search' && 'Search Results'}
                {navigation.view === 'watchlist' && 'Your Watchlist'}
                {navigation.view === 'video' && selectedVideo?.title}
              </h2>
            </div>
          )}

          {navigation.view === 'browse' && (
            <>
              <SourceSelector
                currentSource={currentSource}
                onSourceSelect={handleSourceSelect}
              />
              <SearchBar
                onSearch={handleSearch}
                placeholder={`Search ${currentSource === 'youtube' ? 'YouTube videos' : 'movies and TV shows'}...`}
              />
            </>
          )}
        </div>

        <div className="mt-6 grid gap-6 grid-cols-1">
          {selectedVideo ? (
            <div className="space-y-6">
              <VideoPlayer video={selectedVideo} />
              {currentSource === 'vidsrc' && (
                <ShowDetails
                  show={currentShow || (selectedVideo?.metadata?.type === 'tv' ? selectedVideo : undefined)}
                  episodes={showEpisodes}
                  onEpisodeSelect={handleVideoSelect}
                  currentEpisode={selectedVideo}
                />
              )}
            </div>
          ) : null}

          <div className="w-full">
            {navigation.view === 'watchlist' && isLoggedIn ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Watchlist</h2>
                </div>
                {!watchlist?.length ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your watchlist is empty. Browse videos and click the bookmark icon to add them to your watchlist.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <VideoList
                    videos={watchlist}
                    isLoading={false}
                    error={null}
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                    onAuthRequired={() => setIsAuthDialogOpen(true)}
                  />
                )}
              </>
            ) : searchQuery ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                <VideoList
                  videos={searchResults}
                  isLoading={searchLoading}
                  error={searchError}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </div>
            ) : navigation.view === 'trending' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Trending This Week</h2>
                </div>
                <VideoList
                  videos={trendingContent}
                  isLoading={trendingLoading}
                  error={trendingError}
                  onVideoSelect={handleVideoSelect}
                  selectedVideo={selectedVideo}
                  onAuthRequired={() => setIsAuthDialogOpen(true)}
                />
              </>
            ) : currentSource === 'vidsrc' ? (
              <Tabs defaultValue="movies" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="movies">Movies</TabsTrigger>
                  <TabsTrigger value="shows">TV Shows</TabsTrigger>
                </TabsList>



                <TabsContent value="movies" className="w-full">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">Movie Genres</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {movieGenres?.map(genre => (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreSelect(genre.id, 'movies')}
                          className={`p-4 rounded-lg shadow-sm transition-all duration-200 text-left ${
                            selectedGenreId === genre.id && selectedGenreType === 'movies' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-card hover:bg-accent hover:scale-105'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            {getGenreIcon(genre.id, 'movies')}
                            {genre.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedGenreId && selectedGenreType === 'movies' ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                          {movieGenres?.find(g => g.id === selectedGenreId)?.name} Movies
                        </h2>
                        <button 
                          onClick={() => setSelectedGenreId(null)}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear selection
                        </button>
                      </div>
                      <VideoList
                        videos={genreMovies}
                        isLoading={genreMoviesLoading}
                        error={genreMoviesError}
                        onVideoSelect={handleVideoSelect}
                        selectedVideo={selectedVideo}
                        onAuthRequired={() => setIsAuthDialogOpen(true)}
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold mb-4">Latest Movies</h2>
                      <VideoList
                        videos={movies}
                        isLoading={moviesLoading}
                        error={moviesError}
                        onVideoSelect={handleVideoSelect}
                        selectedVideo={selectedVideo}
                        onAuthRequired={() => setIsAuthDialogOpen(true)}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="shows" className="w-full">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">TV Genres</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {tvGenres?.map(genre => (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreSelect(genre.id, 'tv')}
                          className={`p-4 rounded-lg shadow-sm transition-all duration-200 text-left ${
                            selectedGenreId === genre.id && selectedGenreType === 'tv' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-card hover:bg-accent hover:scale-105'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            {getGenreIcon(genre.id, 'tv')}
                            {genre.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedGenreId && selectedGenreType === 'tv' ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                          {tvGenres?.find(g => g.id === selectedGenreId)?.name} TV Shows
                        </h2>
                        <button 
                          onClick={() => setSelectedGenreId(null)}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear selection
                        </button>
                      </div>
                      <VideoList
                        videos={genreTVShows}
                        isLoading={genreTVShowsLoading}
                        error={genreTVShowsError}
                        onVideoSelect={handleVideoSelect}
                        selectedVideo={selectedVideo}
                        onAuthRequired={() => setIsAuthDialogOpen(true)}
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold mb-4">Popular TV Shows</h2>
                      <VideoList
                        videos={shows}
                        isLoading={showsLoading}
                        error={showsError}
                        onVideoSelect={handleVideoSelect}
                        selectedVideo={selectedVideo}
                        onAuthRequired={() => setIsAuthDialogOpen(true)}
                      />
                    </>
                  )}
                </TabsContent>
              </Tabs>
            ) : null}
          </div>
        </div>
      </main>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
import type { Express } from "express";
import { createServer } from "http";
import { searchSchema, userSchema } from "@shared/schema";
import { searchYouTube } from "./lib/youtube";
import { storage } from "./storage";
import { cache } from "./lib/cache";
import bcrypt from "bcryptjs";
import session from "express-session";
import memorystore from "memorystore";
import { z } from "zod";
import { getLatestMovies, getLatestTVShows, getLatestEpisodes } from './lib/vidsrc';
import { TEST_TV_SHOWS } from './lib/tmdb';

const MemoryStore = memorystore(session);

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

interface Video {
    id: string | number; 
    sourceId: string;
    source: 'youtube' | 'vidsrc';
    title: string;
    description: string;
    thumbnail: string | null;
    metadata: any;
    chapters: any | null;
}

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Session middleware
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Existing routes
  app.get('/api/videos/search', async (req, res) => {
    try {
      const { query, source } = searchSchema.parse(req.query);

      if (source === 'youtube') {
        // Create a cache key based on the search parameters
        const cacheKey = `search:${source}:${query}`;

        // Try to get results from cache first
        const cachedResults = cache.get(cacheKey);
        if (cachedResults) {
          console.log(`Cache hit for search: ${query}`);
          return res.json(cachedResults);
        }

        try {
          console.log(`Cache miss for search: ${query}`);
          const videos = await searchYouTube(query);

          // Cache the results for 5 minutes
          cache.set(cacheKey, videos, 5 * 60 * 1000);

          res.json(videos);
        } catch (error) {
          console.error('YouTube API Error:', error);
          res.status(500).json({ 
            message: error instanceof Error ? error.message : 'Failed to fetch videos from YouTube'
          });
        }
      } else {
        res.status(400).json({ message: 'Unsupported video source' });
      }
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Invalid request parameters'
      });
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = userSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Watchlist routes
  app.get('/api/watchlist', requireAuth, async (req, res) => {
    try {
      const videos = await storage.getWatchlist(req.session.userId!);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post('/api/watchlist/:videoId', requireAuth, async (req, res) => {
    try {
      const { videoId } = req.params;
      const videoData = req.body;
      await storage.addToWatchlist(req.session.userId!, videoId, videoData);
      res.json({ message: 'Added to watchlist' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete('/api/watchlist/:videoId', requireAuth, async (req, res) => {
    try {
      const { videoId } = req.params;
      await storage.removeFromWatchlist(req.session.userId!, videoId);
      res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

  app.get('/api/videos/recommendations', async (req, res) => {
    try {
      const { videoId } = z.object({
        videoId: z.string().min(1)
      }).parse(req.query);

      // Get recommendations from YouTube API with video relation
      const params = new URLSearchParams({
        part: 'snippet',
        maxResults: '10',
        relatedToVideoId: videoId,
        type: 'video',
        key: process.env.VITE_YOUTUBE_API_KEY!
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      const recommendations = data.items.map((item: any) => ({
        id: item.id.videoId,
        sourceId: item.id.videoId,
        source: 'youtube',
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        metadata: item.snippet
      }));

      res.json(recommendations);
    } catch (error) {
      console.error('Recommendation Error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to get recommendations'
      });
    }
  });

  app.get('/api/videos/vidsrc/search', async (req, res) => {
    try {
      const { query } = z.object({
        query: z.string().min(1)
      }).parse(req.query);

      const videos = await searchVidSrc(query);
      res.json(videos);
    } catch (error) {
      console.error('VidSrc Search Error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to search VidSrc'
      });
    }
  });

  app.get('/api/videos/vidsrc/latest/:type', async (req, res) => {
    try {
      const { type } = z.object({
        type: z.enum(['movies', 'shows', 'episodes'])
      }).parse(req.params);

      const page = parseInt(req.query.page as string) || 1;

      let videos: Video[];
      switch (type) {
        case 'movies':
          videos = await getLatestMovies(page);
          break;
        case 'shows':
          videos = await getLatestTVShows(page);
          break;
        case 'episodes':
          videos = await getLatestEpisodes(page);
          break;
        default:
          throw new Error('Invalid content type');
      }

      res.json(videos);
    } catch (error) {
      console.error('VidSrc Latest Content Error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch latest content'
      });
    }
  });

  app.get('/api/videos/vidsrc/:imdbId', async (req, res) => {
    try {
      const { imdbId } = req.params;
      const { type, season, episode } = z.object({
        type: z.enum(['movie', 'tv']).default('movie'),
        season: z.string().optional(),
        episode: z.string().optional()
      }).parse(req.query);

      // TODO: Implement actual VidSrc API fetch
      // For now, return sample data
      const video = createVidSrcVideo({
        imdbId,
        title: type === 'movie' ? 'Sample Movie' : 'Sample TV Show',
        type,
        season: season ? parseInt(season) : undefined,
        episode: episode ? parseInt(episode) : undefined,
        description: `This is a sample ${type === 'movie' ? 'movie' : 'TV show'} from VidSrc`
      });

      res.json(video);
    } catch (error) {
      console.error('VidSrc Error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to get VidSrc video'
      });
    }
  });

  app.get('/api/videos/test-tv', (req, res) => {
    console.log('Serving test TV shows:', TEST_TV_SHOWS.map(show => ({
      title: show.title,
      embedUrl: show.metadata.embedUrl
    })));

    res.json(TEST_TV_SHOWS);
  });

  return httpServer;
}

// Placeholder functions -  Replace these with your actual implementations
async function searchVidSrc(query: string): Promise<Video[]> {
  //  Implement your VidSrc search logic here.  Return an array of video objects.
  return [];
}

function createVidSrcVideo(data: any): Video {
  // Implement your VidSrc video creation logic here.  Return a video object.
  return {
    id: data.imdbId,
    sourceId: data.imdbId,
    source: 'vidsrc',
    title: data.title,
    description: data.description,
    thumbnail: null,
    metadata: { imdbId: data.imdbId, type: data.type, season: data.season, episode: data.episode },
    chapters: null
  };
}
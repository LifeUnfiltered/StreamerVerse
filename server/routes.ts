import type { Express } from "express";
import { createServer } from "http";
import { searchSchema } from "@shared/schema";
import { searchYouTube } from "./lib/youtube";
import { storage } from "./storage";
import { cache } from "./lib/cache";
import session from "express-session";
import memorystore from "memorystore";
import { z } from "zod";
import { 
  fetchLatestTVShows, 
  fetchLatestEpisodes, 
  searchContent, 
  fetchTVShowEpisodes,
  fetchLatestMovies 
} from './lib/tmdb';

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
  description: string | null;
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

  app.get('/api/videos/search', async (req, res) => {
    try {
      const { query, source } = searchSchema.parse(req.query);

      if (source === 'youtube') {
        const cacheKey = `search:${source}:${query}`;
        const cachedResults = cache.get(cacheKey);

        if (cachedResults) {
          return res.json(cachedResults);
        }

        const videos = await searchYouTube(query);
        cache.set(cacheKey, videos, 5 * 60 * 1000);
        res.json(videos);
      } else {
        res.status(400).json({ message: 'Unsupported video source' });
      }
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Invalid request parameters'
      });
    }
  });

  app.get('/api/videos/vidsrc/search', async (req, res) => {
    try {
      const { query } = z.object({
        query: z.string().min(1)
      }).parse(req.query);

      console.log('Processing search request for:', query);
      const videos = await searchContent(query);

      if (videos.length === 0) {
        console.log('No results found for query:', query);
      } else {
        console.log(`Found ${videos.length} results for query:`, query);
      }

      res.json(videos);
    } catch (error) {
      console.error('VidSrc Search Error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to search VidSrc'
      });
    }
  });

  app.get('/api/videos/tv/:showId/episodes', async (req, res) => {
    try {
      const { showId } = req.params;
      const { season } = req.query;

      const episodes = await fetchTVShowEpisodes(
        parseInt(showId),
        season ? parseInt(season as string) : undefined
      );

      res.json(episodes);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      res.status(500).json({ message: 'Failed to fetch episodes' });
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
          videos = await fetchLatestMovies(page);
          break;
        case 'shows':
          videos = await fetchLatestTVShows(page);
          break;
        case 'episodes':
          videos = await fetchLatestEpisodes();
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

  app.get('/api/videos/test-tv', async (req, res) => {
    try {
      const shows = await fetchLatestTVShows(1);
      res.json(shows);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      res.status(500).json({ message: 'Failed to fetch TV shows' });
    }
  });

  return httpServer;
}
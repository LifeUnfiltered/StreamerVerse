import type { Express } from "express";
import { createServer } from "http";
import { searchSchema } from "@shared/schema";
import { searchYouTube } from "./lib/youtube";
import { storage } from "./storage";
import { cache } from "./lib/cache";
import session from "express-session";
import memorystore from "memorystore";
import { z } from "zod";
import express from "express";
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

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session middleware
  // Generate a secure session secret or use an environment variable
  const sessionSecret = process.env.SESSION_SECRET || 
    require('crypto').randomBytes(64).toString('hex');
    
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: { 
        secure: false, // Set to false for development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
      },
      name: 'streamer_verse_session'
    })
  );

  // Authentication middleware with enhanced debug
  const requireAuth = (req: any, res: any, next: any) => {
    console.log("Auth check - Session:", req.session);
    console.log("Auth check - userId in session:", req.session.userId);
    console.log("Auth check - Headers:", req.headers);
    console.log("Auth check - Cookies:", req.headers.cookie);
    
    if (!req.session || !req.session.userId) {
      console.log("Authentication failed: No valid session or userId");
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Authentication successful for userId:", req.session.userId);
    next();
  };

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const user = await storage.createUser({ username, password });
      req.session.userId = user.id;
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // First check the test user since it's hardcoded
      if (username === 'test' && password === 'test') {
        // Create test user if it doesn't exist
        let testUser = await storage.getUserByUsername('test');
        if (!testUser) {
          testUser = await storage.createUser({ username: 'test', password: 'test' });
          console.log('Created test user:', testUser);
        }
        
        req.session.userId = testUser.id;
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
          console.log('Session saved for user:', testUser.id);
        });
        
        return res.json({ id: testUser.id, username: testUser.username });
      }

      // Then check registered users
      const user = await storage.getUserByUsername(username);
      if (user && user.password === password) {
        req.session.userId = user.id;
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
          console.log('Session saved for user:', user.id);
        });
        
        return res.json({ id: user.id, username: user.username });
      }

      res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/user', async (req, res) => {
    console.log("GET /api/user - Session:", req.session);
    console.log("GET /api/user - Cookies:", req.headers.cookie);
    
    if (!req.session.userId) {
      console.log("GET /api/user - No userId in session");
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      console.log("GET /api/user - Fetching user with id:", req.session.userId);
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        console.log("GET /api/user - User not found in database");
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log("GET /api/user - User found:", user);
      res.json({
        id: user.id,
        username: user.username
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

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

  // Watchlist routes
  app.get('/api/watchlist', requireAuth, async (req, res) => {
    try {
      const videos = await storage.getWatchlist(req.session.userId!);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post('/api/watchlist/:videoId', requireAuth, async (req, res) => {
    try {
      const { videoId } = req.params;
      const videoData = req.body;
      const item = await storage.addToWatchlist(req.session.userId!, videoId, videoData);
      res.json(item);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete('/api/watchlist/:videoId', requireAuth, async (req, res) => {
    try {
      const { videoId } = req.params;
      await storage.removeFromWatchlist(req.session.userId!, videoId);
      res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

  return httpServer;
}

interface Video {
  id: string | number;
  sourceId: string;
  source: string;  // Changed from literals to accommodate library return types
  title: string;
  description: string | null;
  thumbnail: string | null;
  metadata: any;
  chapters: any | null;
}
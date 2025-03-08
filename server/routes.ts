import type { Express } from "express";
import { createServer } from "http";
import { searchSchema, userSchema } from "@shared/schema";
import { searchYouTube } from "./lib/youtube";
import { storage } from "./storage";
import { cache } from "./lib/cache";
import bcrypt from "bcryptjs";
import session from "express-session";
import memorystore from "memorystore";

const MemoryStore = memorystore(session);

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
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

  return httpServer;
}
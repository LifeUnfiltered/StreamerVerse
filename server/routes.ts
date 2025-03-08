import type { Express } from "express";
import { createServer } from "http";
import { searchSchema } from "@shared/schema";
import { searchYouTube } from "../client/src/lib/youtube";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get('/api/videos/search', async (req, res) => {
    try {
      const { query, source } = searchSchema.parse(req.query);
      
      if (source === 'youtube') {
        const videos = await searchYouTube(query);
        res.json(videos);
      } else {
        res.status(400).json({ message: 'Unsupported video source' });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  return httpServer;
}

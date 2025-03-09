import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  users, videos, watchlist,
  type User, type InsertUser,
  type Video, type WatchlistItem
} from "@shared/schema";
import { and, eq } from 'drizzle-orm';

export interface IStorage {
  // User operations
  createUser(user: any): Promise<any>;
  getUserByUsername(username: string): Promise<any | undefined>;
  getUser(id: number): Promise<any | undefined>;

  // Watchlist operations
  addToWatchlist(userId: number, videoId: string, videoData: Video): Promise<any>;
  removeFromWatchlist(userId: number, videoId: string): Promise<void>;
  getWatchlist(userId: number): Promise<Video[]>;
  isInWatchlist(userId: number, videoId: string): Promise<boolean>;
}

// In-memory storage implementation for development
class MemStorage implements IStorage {
  private users: Map<number, any> = new Map();
  private watchlists: Map<number, Map<string, Video>> = new Map();
  private videos: Map<string, Video> = new Map();

  async createUser(user: any): Promise<any> {
    const id = this.users.size + 1;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async addToWatchlist(userId: number, videoId: string, videoData: Video): Promise<any> {
    // Store video data
    this.videos.set(videoId, videoData);

    // Add to user's watchlist
    if (!this.watchlists.has(userId)) {
      this.watchlists.set(userId, new Map());
    }
    this.watchlists.get(userId)!.set(videoId, videoData);

    return { userId, videoId };
  }

  async removeFromWatchlist(userId: number, videoId: string): Promise<void> {
    const userWatchlist = this.watchlists.get(userId);
    if (userWatchlist) {
      userWatchlist.delete(videoId);
    }
  }

  async getWatchlist(userId: number): Promise<Video[]> {
    const userWatchlist = this.watchlists.get(userId);
    return userWatchlist ? Array.from(userWatchlist.values()) : [];
  }

  async isInWatchlist(userId: number, videoId: string): Promise<boolean> {
    const userWatchlist = this.watchlists.get(userId);
    return userWatchlist ? userWatchlist.has(videoId) : false;
  }
}

export const storage = new MemStorage();
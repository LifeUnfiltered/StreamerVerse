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
  createUser(user: { username: string, password: string }): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;

  // Watchlist operations
  addToWatchlist(userId: number, videoId: string, videoData: Video): Promise<WatchlistItem>;
  removeFromWatchlist(userId: number, videoId: string): Promise<void>;
  getWatchlist(userId: number): Promise<Video[]>;
  isInWatchlist(userId: number, videoId: string): Promise<boolean>;
}

// In-memory storage implementation for development
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private watchlists: Map<number, Map<string, Video>> = new Map();
  private videos: Map<string, Video> = new Map();

  async createUser(user: { username: string, password: string }): Promise<User> {
    const id = this.users.size + 1;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async addToWatchlist(userId: number, videoId: string, videoData: Video): Promise<WatchlistItem> {
    // Store video data
    this.videos.set(videoId, videoData);

    // Add to user's watchlist
    if (!this.watchlists.has(userId)) {
      this.watchlists.set(userId, new Map());
    }
    this.watchlists.get(userId)!.set(videoId, videoData);

    return { 
      id: Date.now(), // Generate a unique ID
      userId, 
      videoId,
      addedAt: new Date()
    };
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
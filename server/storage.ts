import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  users, videos, watchlist, watchHistory,
  type User, type InsertUser,
  type Video, type WatchlistItem, type WatchHistoryItem
} from "@shared/schema";
import { and, eq, desc } from 'drizzle-orm';

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
  
  // Watch history operations
  addToWatchHistory(userId: number, videoId: string, videoData: Video, position: number, duration: number): Promise<WatchHistoryItem>;
  updateWatchProgress(userId: number, videoId: string, position: number, isCompleted: boolean): Promise<void>;
  getWatchHistory(userId: number, limit?: number): Promise<(Video & { lastPosition?: number, duration?: number, watchedAt?: Date })[]>;
  getContinueWatching(userId: number, limit?: number): Promise<(Video & { lastPosition?: number, duration?: number, watchedAt?: Date })[]>;
}

// In-memory storage implementation for development
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private watchlists: Map<number, Map<string, Video>> = new Map();
  private videos: Map<string, Video> = new Map();
  private watchHistory: Map<number, Map<string, {
    video: Video,
    lastPosition: number,
    duration: number,
    isCompleted: boolean,
    watchedAt: Date
  }>> = new Map();

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

  // Watch history operations implementation
  async addToWatchHistory(
    userId: number,
    videoId: string, 
    videoData: Video, 
    position: number, 
    duration: number
  ): Promise<WatchHistoryItem> {
    // Store video data if not already stored
    if (!this.videos.has(videoId)) {
      this.videos.set(videoId, videoData);
    }

    // Initialize user's watch history if it doesn't exist
    if (!this.watchHistory.has(userId)) {
      this.watchHistory.set(userId, new Map());
    }

    const userHistory = this.watchHistory.get(userId)!;
    const now = new Date();
    
    // Add or update entry in watch history
    userHistory.set(videoId, {
      video: videoData,
      lastPosition: position,
      duration: duration,
      isCompleted: position >= duration * 0.9, // Mark as completed if watched 90% or more
      watchedAt: now
    });

    // Return a WatchHistoryItem-compatible object
    return {
      id: Date.now(),
      userId,
      videoId,
      lastPosition: position,
      isCompleted: position >= duration * 0.9,
      duration,
      watchedAt: now
    };
  }

  async updateWatchProgress(
    userId: number, 
    videoId: string, 
    position: number, 
    isCompleted: boolean
  ): Promise<void> {
    const userHistory = this.watchHistory.get(userId);
    if (!userHistory) return;

    const entry = userHistory.get(videoId);
    if (!entry) return;

    // Update watch progress
    entry.lastPosition = position;
    entry.isCompleted = isCompleted;
    entry.watchedAt = new Date(); // Update timestamp
    
    userHistory.set(videoId, entry);
  }

  async getWatchHistory(
    userId: number, 
    limit: number = 20
  ): Promise<(Video & { lastPosition?: number, duration?: number, watchedAt?: Date })[]> {
    const userHistory = this.watchHistory.get(userId);
    if (!userHistory) return [];

    // Get all entries and sort by watchedAt (most recent first)
    const entries = Array.from(userHistory.entries())
      .sort((a, b) => b[1].watchedAt.getTime() - a[1].watchedAt.getTime())
      .slice(0, limit)
      .map(([_, entry]) => ({
        ...entry.video,
        lastPosition: entry.lastPosition,
        duration: entry.duration,
        watchedAt: entry.watchedAt
      }));

    return entries;
  }

  async getContinueWatching(
    userId: number, 
    limit: number = 10
  ): Promise<(Video & { lastPosition?: number, duration?: number, watchedAt?: Date })[]> {
    const userHistory = this.watchHistory.get(userId);
    if (!userHistory) return [];

    // Get all entries that are not completed, sort by watchedAt (most recent first)
    const entries = Array.from(userHistory.entries())
      .filter(([_, entry]) => !entry.isCompleted)
      .sort((a, b) => b[1].watchedAt.getTime() - a[1].watchedAt.getTime())
      .slice(0, limit)
      .map(([_, entry]) => ({
        ...entry.video,
        lastPosition: entry.lastPosition,
        duration: entry.duration,
        watchedAt: entry.watchedAt
      }));

    return entries;
  }
}

export const storage = new MemStorage();
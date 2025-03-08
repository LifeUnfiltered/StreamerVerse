import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  users, videos, watchlist,
  type User, type InsertUser,
  type Video, type WatchlistItem
} from "@shared/schema";
import { and, eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;

  // Watchlist operations
  addToWatchlist(userId: number, videoId: string): Promise<WatchlistItem>;
  removeFromWatchlist(userId: number, videoId: string): Promise<void>;
  getWatchlist(userId: number): Promise<Video[]>;
  isInWatchlist(userId: number, videoId: string): Promise<boolean>;
}

export class DBStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async addToWatchlist(userId: number, videoId: string): Promise<WatchlistItem> {
    const [item] = await db.insert(watchlist)
      .values({ userId, videoId })
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: number, videoId: string): Promise<void> {
    await db.delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.videoId, videoId)
        )
      );
  }

  async getWatchlist(userId: number): Promise<Video[]> {
    const items = await db.select({
      id: watchlist.id,
      videoId: watchlist.videoId
    })
    .from(watchlist)
    .where(eq(watchlist.userId, userId));

    // Return videos with the correct type structure
    return items.map(item => ({
      id: parseInt(item.videoId),
      sourceId: item.videoId,
      source: 'youtube',
      title: '', // These will be populated when displaying
      description: '',
      thumbnail: '',
      metadata: null
    }));
  }

  async isInWatchlist(userId: number, videoId: string): Promise<boolean> {
    const result = await db.select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.videoId, videoId)
        )
      );
    return result.length > 0;
  }
}

export const storage = new DBStorage();
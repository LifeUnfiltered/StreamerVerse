import { pgTable, text, serial, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// New users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// New watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  videoId: text("video_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Schemas
export const videoSchema = createInsertSchema(videos).pick({
  sourceId: true,
  source: true,
  title: true,
  description: true,
  thumbnail: true,
  metadata: true,
});

export const userSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const watchlistSchema = createInsertSchema(watchlist).pick({
  userId: true,
  videoId: true,
});

export const searchSchema = z.object({
  query: z.string().min(1),
  source: z.enum(['youtube']).default('youtube')
});

// Types
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof videoSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof userSchema>;

export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof watchlistSchema>;

export type SearchParams = z.infer<typeof searchSchema>;

// Add cache entry type
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}
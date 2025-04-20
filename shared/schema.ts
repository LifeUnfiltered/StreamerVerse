import { pgTable, text, serial, json, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chapter schema
export const chapterSchema = z.object({
  timestamp: z.number(),
  title: z.string(),
  description: z.string().optional(),
});

export type Chapter = z.infer<typeof chapterSchema>;

// Existing videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  metadata: json("metadata").$type<Record<string, any>>(),
  chapters: json("chapters").$type<Chapter[]>().default([]), // Add chapters field
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  videoId: text("video_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// New table for tracking watched videos
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  videoId: text("video_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow(),
  lastPosition: integer("last_position").default(0), // Track playback position in seconds
  isCompleted: boolean("is_completed").default(false),
  duration: integer("duration").default(0), // Total duration of video in seconds
});

// Schemas
export const videoSchema = createInsertSchema(videos).pick({
  sourceId: true,
  source: true,
  title: true,
  description: true,
  thumbnail: true,
  metadata: true,
  chapters: true,
});

export const userSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const watchlistSchema = createInsertSchema(watchlist).pick({
  userId: true,
  videoId: true,
});

export const watchHistorySchema = createInsertSchema(watchHistory).pick({
  userId: true,
  videoId: true,
  lastPosition: true,
  isCompleted: true,
  duration: true,
});

export const searchSchema = z.object({
  query: z.string().min(1),
  source: z.string().default('youtube')
});

// Types
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof videoSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof userSchema>;

export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof watchlistSchema>;

export type WatchHistoryItem = typeof watchHistory.$inferSelect;
export type InsertWatchHistoryItem = z.infer<typeof watchHistorySchema>;

export type SearchParams = z.infer<typeof searchSchema>;

// Add cache entry type
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}
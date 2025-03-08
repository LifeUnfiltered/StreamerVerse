import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  metadata: json("metadata").$type<Record<string, any>>(),
});

export const videoSchema = createInsertSchema(videos).pick({
  sourceId: true,
  source: true,
  title: true,
  description: true,
  thumbnail: true,
  metadata: true,
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof videoSchema>;

export const searchSchema = z.object({
  query: z.string().min(1),
  source: z.enum(['youtube']).default('youtube')
});

export type SearchParams = z.infer<typeof searchSchema>;

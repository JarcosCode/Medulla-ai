import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  password: text("password").notNull(),
});

export const dailyLimits = pgTable("daily_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  songRecsCount: integer("song_recs_count").notNull().default(0),
  playlistRecsCount: integer("playlist_recs_count").notNull().default(0),
  date: timestamp("date").notNull(),
});

export const savedPlaylists = pgTable("saved_playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  genres: text("genres").array(),
  mood: text("mood"),
  youtubeUrl: text("youtube_url"),
  spotifyUrl: text("spotify_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
  password: true,
});

export const insertPlaylistSchema = createInsertSchema(savedPlaylists).pick({
  name: true,
  description: true,
  genres: true,
  mood: true,
  youtubeUrl: true,
  spotifyUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DailyLimit = typeof dailyLimits.$inferSelect;
export type SavedPlaylist = typeof savedPlaylists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
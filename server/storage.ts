import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import type { IStorage } from "./types";
import { users, dailyLimits, savedPlaylists, type User, type InsertUser, type DailyLimit, type SavedPlaylist, type InsertPlaylist } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getDailyLimits(sessionId: string, userId?: number): Promise<{
    songRecsCount: number;
    playlistRecsCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db
      .select()
      .from(dailyLimits)
      .where(
        and(
          userId ? eq(dailyLimits.userId, userId) : eq(dailyLimits.sessionId, sessionId),
          eq(dailyLimits.date, today)
        )
      );

    if (result.length === 0) {
      return { songRecsCount: 0, playlistRecsCount: 0 };
    }

    return {
      songRecsCount: result[0].songRecsCount,
      playlistRecsCount: result[0].playlistRecsCount,
    };
  }

  async incrementDailyLimits(
    sessionId: string,
    userId: number | undefined,
    type: "songs" | "playlists"
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(dailyLimits)
      .where(
        and(
          userId ? eq(dailyLimits.userId, userId) : eq(dailyLimits.sessionId, sessionId),
          eq(dailyLimits.date, today)
        )
      );

    if (existing.length === 0) {
      await db.insert(dailyLimits).values({
        userId: userId || null,
        sessionId,
        songRecsCount: type === "songs" ? 1 : 0,
        playlistRecsCount: type === "playlists" ? 1 : 0,
        date: today,
      });
    } else {
      await db
        .update(dailyLimits)
        .set({
          songRecsCount:
            type === "songs"
              ? existing[0].songRecsCount + 1
              : existing[0].songRecsCount,
          playlistRecsCount:
            type === "playlists"
              ? existing[0].playlistRecsCount + 1
              : existing[0].playlistRecsCount,
        })
        .where(eq(dailyLimits.id, existing[0].id));
    }
  }

  // New methods for saved playlists
  async getSavedPlaylists(userId: number): Promise<SavedPlaylist[]> {
    return await db
      .select()
      .from(savedPlaylists)
      .where(eq(savedPlaylists.userId, userId))
      .orderBy(savedPlaylists.createdAt);
  }

  async savePlaylist(userId: number, playlist: InsertPlaylist): Promise<SavedPlaylist> {
    const result = await db
      .insert(savedPlaylists)
      .values({ ...playlist, userId })
      .returning();
    return result[0];
  }

  async deleteSavedPlaylist(userId: number, playlistId: number): Promise<void> {
    await db
      .delete(savedPlaylists)
      .where(
        and(
          eq(savedPlaylists.id, playlistId),
          eq(savedPlaylists.userId, userId)
        )
      );
  }
}

// Create and export a single instance of DatabaseStorage
export const storage = new DatabaseStorage();
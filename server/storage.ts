import type { IStorage } from "./types";
import { User, InsertUser, DailyLimit } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dailyLimits: Map<string, DailyLimit>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.dailyLimits = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDailyLimits(sessionId: string, userId?: number): Promise<{
    songRecsCount: number;
    playlistRecsCount: number;
  }> {
    const key = userId ? `user_${userId}` : `session_${sessionId}`;
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${key}_${today}`;
    
    const limits = this.dailyLimits.get(storageKey);
    if (!limits) {
      return { songRecsCount: 0, playlistRecsCount: 0 };
    }
    
    return {
      songRecsCount: limits.songRecsCount,
      playlistRecsCount: limits.playlistRecsCount,
    };
  }

  async incrementDailyLimits(sessionId: string, userId: number | undefined, type: 'songs' | 'playlists'): Promise<void> {
    const key = userId ? `user_${userId}` : `session_${sessionId}`;
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${key}_${today}`;
    
    const current = await this.getDailyLimits(sessionId, userId);
    
    this.dailyLimits.set(storageKey, {
      id: 0,
      userId: userId || 0,
      sessionId,
      songRecsCount: type === 'songs' ? current.songRecsCount + 1 : current.songRecsCount,
      playlistRecsCount: type === 'playlists' ? current.playlistRecsCount + 1 : current.playlistRecsCount,
      date: new Date(),
    });
  }
}

export const storage = new MemStorage();

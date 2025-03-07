import { User, InsertUser, SavedPlaylist, InsertPlaylist } from "@shared/schema";
import { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;

  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  getDailyLimits(sessionId: string, userId?: number): Promise<{
    songRecsCount: number;
    playlistRecsCount: number;
  }>;

  incrementDailyLimits(
    sessionId: string,
    userId: number | undefined,
    type: "songs" | "playlists"
  ): Promise<void>;

  // New methods for saved playlists
  getSavedPlaylists(userId: number): Promise<SavedPlaylist[]>;
  savePlaylist(userId: number, playlist: InsertPlaylist): Promise<SavedPlaylist>;
  deleteSavedPlaylist(userId: number, playlistId: number): Promise<void>;
}
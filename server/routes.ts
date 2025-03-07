import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { getMusicRecommendations } from "./openai";
import { getTrendingVideos } from "./youtube";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/daily-limits", async (req, res) => {
    const sessionId = req.sessionID;
    const userId = req.user?.id;
    const limits = await storage.getDailyLimits(sessionId, userId);
    res.json(limits);
  });

  app.get("/api/trending", async (_req, res) => {
    try {
      const trending = await getTrendingVideos();
      res.json(trending);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    const { preferences, type } = req.body;
    const sessionId = req.sessionID;
    const userId = req.user?.id;

    try {
      const limits = await storage.getDailyLimits(sessionId, userId);
      const maxSongs = 5;
      const maxPlaylists = 3;

      if (
        (type === "songs" && limits.songRecsCount >= maxSongs) ||
        (type === "playlists" && limits.playlistRecsCount >= maxPlaylists)
      ) {
        return res.status(429).json({
          message: "You've reached your daily limit. Please create an account to continue.",
        });
      }

      const recommendations = await getMusicRecommendations(preferences, type);

      await storage.incrementDailyLimits(sessionId, userId, type);

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // New routes for saved playlists
  app.get("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const playlists = await storage.getSavedPlaylists(req.user!.id);
      res.json(playlists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const playlist = await storage.savePlaylist(req.user!.id, req.body);
      res.status(201).json(playlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      await storage.deleteSavedPlaylist(req.user!.id, parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { getMusicRecommendations } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/daily-limits", async (req, res) => {
    const sessionId = req.sessionID;
    const userId = req.user?.id;
    const limits = await storage.getDailyLimits(sessionId, userId);
    res.json(limits);
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

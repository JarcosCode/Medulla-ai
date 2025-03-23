import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMusicRecommendations } from "./openai";
import { getTrendingVideos } from "./youtube";
import { authenticateJWT } from "./auth";
import jwt from "jsonwebtoken";
import { User as SelectUser } from "@shared/schema";

// Extend Express.Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: SelectUser;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/daily-limits", authenticateJWT, async (req, res) => {
    const userId = req.user?.id;
    const limits = await storage.getDailyLimits("", userId);
    res.json(limits);
  });

  app.get("/api/trending", async (_req, res) => {
    try {
      console.log("Starting trending videos request");
      const trending = await getTrendingVideos();
      console.log("Trending videos response:", {
        success: true,
        videoCount: Object.keys(trending).length,
        categories: Object.keys(trending)
      });
      res.json(trending);
    } catch (error: any) {
      console.error("Error fetching trending videos:", {
        error: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      res.status(500).json({ 
        message: "Failed to fetch trending videos",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    console.log("Recommendation request:", {
      body: req.body,
      headers: req.headers,
      method: req.method,
      path: req.path,
      authenticated: !!req.headers.authorization
    });

    const { preferences, type } = req.body;
    if (!preferences || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type !== "songs" && type !== "playlists") {
      return res.status(400).json({ message: "Invalid type. Must be 'songs' or 'playlists'" });
    }

    try {
      // Check if request is authenticated
      let userId: number | undefined;
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SelectUser;
          userId = decoded.id;
        } catch (err) {
          console.error("JWT verification failed:", err);
        }
      }

      // If authenticated, check daily limits
      if (userId) {
        const dailyLimits = await storage.getDailyLimits("", userId);
        const totalCount = dailyLimits.songRecsCount + dailyLimits.playlistRecsCount;
        if (totalCount >= 10) {
          return res.status(429).json({ 
            message: "You've reached your daily limit. Please try again tomorrow." 
          });
        }
      }

      const recommendations = await getMusicRecommendations(preferences, type);
      
      // Only increment limits for authenticated users
      if (userId) {
        await storage.incrementDailyLimits("", userId, type);
      }

      res.json(recommendations);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });

  // New routes for saved playlists
  app.get("/api/playlists", authenticateJWT, async (req, res) => {
    try {
      const playlists = await storage.getSavedPlaylists(req.user!.id);
      res.json(playlists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/playlists", authenticateJWT, async (req, res) => {
    try {
      const playlist = await storage.savePlaylist(req.user!.id, req.body);
      res.status(201).json(playlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/playlists/:id", authenticateJWT, async (req, res) => {
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
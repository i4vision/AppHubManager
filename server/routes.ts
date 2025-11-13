import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint (no database dependency)
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/apps", async (_req, res) => {
    try {
      const apps = await storage.getAllApps();
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  app.post("/api/apps", async (req, res) => {
    try {
      // Validate access code first
      const accessCode = req.body.accessCode;
      const expectedAccessCode = process.env.ACCESS_CODE;

      if (!expectedAccessCode) {
        res.status(500).json({ error: "Access code not configured on server" });
        return;
      }

      if (!accessCode || accessCode !== expectedAccessCode) {
        res.status(403).json({ error: "Invalid access code" });
        return;
      }

      // Remove access code from data before validation and storage
      const { accessCode: _, ...appData } = req.body;
      const validatedData = insertAppSchema.parse(appData);
      const newApp = await storage.createApp(validatedData);
      res.status(201).json(newApp);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid app data", details: error });
      } else {
        res.status(500).json({ error: "Failed to create app" });
      }
    }
  });

  app.delete("/api/apps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteApp(id);
      if (deleted) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "App not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete app" });
    }
  });

  const updatePositionsSchema = z.array(
    z.object({
      id: z.string(),
      position: z.number(),
    })
  );

  app.patch("/api/apps/positions", async (req, res) => {
    try {
      const validatedData = updatePositionsSchema.parse(req.body);
      await storage.updateAppPositions(validatedData);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({ error: "Invalid position data", details: error });
      } else {
        res.status(500).json({ error: "Failed to update positions" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

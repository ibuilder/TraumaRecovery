import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Healing Together API is running" });
  });

  return httpServer;
}

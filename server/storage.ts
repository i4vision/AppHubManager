import { type App, type InsertApp } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllApps(): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
  deleteApp(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private apps: Map<string, App>;

  constructor() {
    this.apps = new Map();
  }

  async getAllApps(): Promise<App[]> {
    return Array.from(this.apps.values());
  }

  async createApp(insertApp: InsertApp): Promise<App> {
    const id = randomUUID();
    const app: App = { ...insertApp, id };
    this.apps.set(id, app);
    return app;
  }

  async deleteApp(id: string): Promise<boolean> {
    return this.apps.delete(id);
  }
}

export const storage = new MemStorage();

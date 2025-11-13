import { type App, type InsertApp, apps } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllApps(): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
  deleteApp(id: string): Promise<boolean>;
  updateAppPositions(updates: { id: string; position: number }[]): Promise<void>;
}

export class DbStorage implements IStorage {
  async getAllApps(): Promise<App[]> {
    return await db.select().from(apps);
  }

  async createApp(insertApp: InsertApp): Promise<App> {
    const [app] = await db.insert(apps).values(insertApp).returning();
    return app;
  }

  async deleteApp(id: string): Promise<boolean> {
    const result = await db.delete(apps).where(eq(apps.id, id)).returning({ id: apps.id });
    return result.length > 0;
  }

  async updateAppPositions(updates: { id: string; position: number }[]): Promise<void> {
    for (const update of updates) {
      await db.update(apps).set({ position: update.position }).where(eq(apps.id, update.id));
    }
  }
}

export const storage = new DbStorage();

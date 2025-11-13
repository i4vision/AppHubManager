import { sql } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: text("category"),
  position: integer("position").notNull().default(0),
});

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
  position: true,
}).extend({
  url: z.string().url("Please enter a valid URL"),
});

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

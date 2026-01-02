import { z } from "zod";

export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string(),
  order: z.number(),
  readingTime: z.string(),
  content: z.string(),
  subchapters: z.array(z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    order: z.number(),
  })),
});

export type Chapter = z.infer<typeof chapterSchema>;
export type Subchapter = Chapter["subchapters"][number];

export const bookInfoSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  author: z.string(),
  description: z.string(),
});

export type BookInfo = z.infer<typeof bookInfoSchema>;

// Re-export user types for compatibility
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

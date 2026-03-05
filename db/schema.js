import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Define the 'demo_users' table
export const demoUsers = pgTable("demo_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types for type-safe queries (JSDoc comments for IDE support)
/**
 * @typedef {typeof demoUsers.$inferSelect} User
 * @typedef {typeof demoUsers.$inferInsert} NewUser
 */

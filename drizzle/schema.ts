import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Email for email/password authentication */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Hashed password for email/password authentication */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Legacy OAuth field (optional, for future OAuth integration)
  openId: varchar("openId", { length: 64 }).unique(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Prescripts table for storing user study tasks
 */
export const prescripts = mysqlTable("prescripts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  duration: int("duration").notNull(), // in minutes
  category: varchar("category", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prescript = typeof prescripts.$inferSelect;
export type InsertPrescript = typeof prescripts.$inferInsert;

/**
 * Sessions table for tracking completed prescript sessions
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prescriptId: int("prescriptId").notNull(),
  status: mysqlEnum("status", ["completed", "failed"]).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

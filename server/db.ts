import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertPrescript, users, prescripts, sessions } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create a new user with email and password
 */
export async function createUser(email: string, passwordHash: string, name?: string): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(users).values({
    email,
    passwordHash,
    name: name || null,
    loginMethod: "email",
  });

  // Fetch the created user to get the ID
  const createdUser = await getUserByEmail(email);
  if (!createdUser) {
    throw new Error("Failed to create user");
  }

  return { id: createdUser.id };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a prescript for a user
 */
export async function createPrescript(userId: number, name: string, duration: number, category?: string, description?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(prescripts).values({
    userId,
    name,
    duration,
    category: category || null,
    description: description || null,
  });

  return { id: (result as any).insertId as number };
}

/**
 * Get all prescripts for a user
 */
export async function getUserPrescripts(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(prescripts).where(eq(prescripts.userId, userId));
}

/**
 * Get a specific prescript
 */
export async function getPrescriptById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(prescripts).where(eq(prescripts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Delete a prescript
 */
export async function deletePrescript(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(prescripts).where(eq(prescripts.id, id));
}

/**
 * Record a completed session
 */
export async function recordSession(userId: number, prescriptId: number, status: "completed" | "failed") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(sessions).values({
    userId,
    prescriptId,
    status,
  });

  return { id: (result as any).insertId as number };
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(sessions).where(eq(sessions.userId, userId));
}

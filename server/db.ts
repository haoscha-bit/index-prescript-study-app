import { eq, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertPrescript, users, prescripts, sessions, decks } from "../drizzle/schema";

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

// ─── User Helpers ────────────────────────────────────────────────────────────

export async function createUser(email: string, passwordHash: string, name?: string): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(users).values({
    email,
    passwordHash,
    name: name || null,
    loginMethod: "email",
  });

  const createdUser = await getUserByEmail(email);
  if (!createdUser) throw new Error("Failed to create user");
  return { id: createdUser.id };
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Deck Helpers ────────────────────────────────────────────────────────────

export async function createDeck(userId: number, name: string): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(decks).values({ userId, name });

  // Fetch the created deck
  const userDecks = await getUserDecks(userId);
  const created = userDecks.find(d => d.name === name);
  if (!created) throw new Error("Failed to create deck");
  return { id: created.id };
}

export async function getUserDecks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(decks).where(eq(decks.userId, userId));
}

export async function getDeckById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function renameDeck(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(decks).set({ name }).where(eq(decks.id, id));
}

export async function deleteDeck(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Unassign all prescripts from this deck (set deckId to null)
  await db.update(prescripts).set({ deckId: null }).where(eq(prescripts.deckId, id));
  // Delete the deck
  await db.delete(decks).where(eq(decks.id, id));
}

// ─── Prescript Helpers ───────────────────────────────────────────────────────

export async function createPrescript(
  userId: number,
  name: string,
  duration: number,
  category?: string,
  description?: string,
  deckId?: number | null,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(prescripts).values({
    userId,
    name,
    duration,
    category: category || null,
    description: description || null,
    deckId: deckId ?? null,
  });

  // MySQL2 returns [ResultSetHeader, undefined]
  const insertId = (result as any)?.[0]?.insertId ?? (result as any)?.insertId;
  return { id: insertId as number };
}

export async function getUserPrescripts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescripts).where(eq(prescripts.userId, userId));
}

export async function getPrescriptsByDeck(userId: number, deckId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescripts).where(
    and(eq(prescripts.userId, userId), eq(prescripts.deckId, deckId))
  );
}

export async function getUnassignedPrescripts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prescripts).where(
    and(eq(prescripts.userId, userId), isNull(prescripts.deckId))
  );
}

export async function getPrescriptById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(prescripts).where(eq(prescripts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePrescriptDeck(id: number, deckId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(prescripts).set({ deckId }).where(eq(prescripts.id, id));
}

export async function deletePrescript(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(prescripts).where(eq(prescripts.id, id));
}

// ─── Session Helpers ─────────────────────────────────────────────────────────

export async function recordSession(userId: number, prescriptId: number, status: "completed" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values({
    userId,
    prescriptId,
    status,
  });

  // MySQL2 returns [ResultSetHeader, undefined]
  const insertId = (result as any)?.[0]?.insertId ?? (result as any)?.insertId;
  return { id: insertId as number };
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.userId, userId));
}

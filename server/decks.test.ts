import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// We need a real authenticated user for protected procedures.
// Register a unique user for this test suite, then create an authenticated context.

let testUserId: number;
const testEmail = `decktest${Date.now()}${Math.floor(Math.random() * 100000)}@example.com`;
const testPassword = "DeckTestPass123!";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as any as TrpcContext["res"],
  };
}

function createAuthContext(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `deck-test-user-${userId}`,
      email: testEmail,
      name: "Deck Test User",
      loginMethod: "email",
      passwordHash: "",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as any as TrpcContext["res"],
  };
}

describe("Deck CRUD", () => {
  beforeAll(async () => {
    // Register a test user to get a valid userId
    const publicCaller = appRouter.createCaller(createPublicContext());
    await publicCaller.auth.register({
      email: testEmail,
      password: testPassword,
    });

    // Login to get the user object with id
    const loginResult = await publicCaller.auth.login({
      email: testEmail,
      password: testPassword,
    });
    testUserId = loginResult.user!.id;
  });

  it("should create a deck", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));
    const result = await caller.decks.create({ name: "Mathematics" });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list decks for the user", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));
    // Create another deck
    await caller.decks.create({ name: "Science" });

    const deckList = await caller.decks.list();
    expect(Array.isArray(deckList)).toBe(true);
    expect(deckList.length).toBeGreaterThanOrEqual(2);

    const names = deckList.map((d: any) => d.name);
    expect(names).toContain("Mathematics");
    expect(names).toContain("Science");
  });

  it("should rename a deck", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));
    const deckList = await caller.decks.list();
    const mathDeck = deckList.find((d: any) => d.name === "Mathematics");
    expect(mathDeck).toBeDefined();

    const result = await caller.decks.rename({ id: mathDeck!.id, name: "Advanced Mathematics" });
    expect(result).toEqual({ success: true });

    // Verify rename
    const updatedList = await caller.decks.list();
    const renamedDeck = updatedList.find((d: any) => d.id === mathDeck!.id);
    expect(renamedDeck?.name).toBe("Advanced Mathematics");
  });

  it("should assign a prescript to a deck", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));

    // Create a prescript
    const prescript = await caller.prescripts.create({
      name: "Study Calculus",
      duration: 30,
      category: "Math",
    });

    // Get deck
    const deckList = await caller.decks.list();
    const deck = deckList.find((d: any) => d.name === "Advanced Mathematics");
    expect(deck).toBeDefined();

    // Assign prescript to deck
    const result = await caller.prescripts.updateDeck({
      id: prescript.id,
      deckId: deck!.id,
    });
    expect(result).toEqual({ success: true });

    // Verify assignment via listByDeck
    const deckPrescripts = await caller.prescripts.listByDeck({ deckId: deck!.id });
    expect(deckPrescripts.some((p: any) => p.id === prescript.id)).toBe(true);
  });

  it("should unassign a prescript from a deck", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));

    // Get all prescripts
    const allPrescripts = await caller.prescripts.list();
    const assignedPrescript = allPrescripts.find((p: any) => p.deckId !== null);
    expect(assignedPrescript).toBeDefined();

    // Unassign
    const result = await caller.prescripts.updateDeck({
      id: assignedPrescript!.id,
      deckId: null,
    });
    expect(result).toEqual({ success: true });

    // Verify it's now unassigned
    const unassigned = await caller.prescripts.listUnassigned();
    expect(unassigned.some((p: any) => p.id === assignedPrescript!.id)).toBe(true);
  });

  it("should delete a deck and unassign its prescripts", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));

    // Create a deck and assign a prescript to it
    const newDeck = await caller.decks.create({ name: "To Delete" });
    const prescript = await caller.prescripts.create({
      name: "Temp Task",
      duration: 15,
      deckId: newDeck.id,
    });

    // Verify prescript is in the deck
    const deckPrescripts = await caller.prescripts.listByDeck({ deckId: newDeck.id });
    expect(deckPrescripts.some((p: any) => p.id === prescript.id)).toBe(true);

    // Delete the deck
    const result = await caller.decks.delete({ id: newDeck.id });
    expect(result).toEqual({ success: true });

    // Verify deck is gone
    const deckList = await caller.decks.list();
    expect(deckList.find((d: any) => d.id === newDeck.id)).toBeUndefined();

    // Verify prescript is now unassigned (deckId = null)
    const allPrescripts = await caller.prescripts.list();
    const updatedPrescript = allPrescripts.find((p: any) => p.id === prescript.id);
    expect(updatedPrescript?.deckId).toBeNull();
  });

  it("should not allow deleting another user's deck", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));
    const deckList = await caller.decks.list();
    const existingDeck = deckList[0];
    expect(existingDeck).toBeDefined();

    // Create a context for a different user
    const otherCaller = appRouter.createCaller(createAuthContext(999999));

    try {
      await otherCaller.decks.delete({ id: existingDeck.id });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (err: any) {
      expect(err.code).toBe("FORBIDDEN");
    }
  });

  it("should create a prescript with deckId directly", async () => {
    const caller = appRouter.createCaller(createAuthContext(testUserId));

    const deckList = await caller.decks.list();
    const deck = deckList[0];
    expect(deck).toBeDefined();

    const prescript = await caller.prescripts.create({
      name: "Direct Deck Assignment",
      duration: 45,
      category: "Test",
      deckId: deck.id,
    });

    expect(prescript).toHaveProperty("id");

    // Verify it's in the deck
    const deckPrescripts = await caller.prescripts.listByDeck({ deckId: deck.id });
    expect(deckPrescripts.some((p: any) => p.id === prescript.id)).toBe(true);
  });
});

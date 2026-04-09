import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("auth.register and auth.login", () => {
  it("should register a new user with email and password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
    const testPassword = "TestPassword123!";

    const result = await caller.auth.register({
      email: testEmail,
      password: testPassword,
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("sessionToken");
  });

  it("should login with correct credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
    const testPassword = "TestPassword123!";

    // Register first
    await caller.auth.register({
      email: testEmail,
      password: testPassword,
    });

    // Now login
    const result = await caller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("user");
    expect(result.user?.email).toBe(testEmail);
  });

  it("should fail login with incorrect password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
    const testPassword = "TestPassword123!";

    // Register first
    await caller.auth.register({
      email: testEmail,
      password: testPassword,
    });

    // Try to login with wrong password
    try {
      await caller.auth.login({
        email: testEmail,
        password: "WrongPassword123!",
      });
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.message).toContain("Invalid");
    }
  });

  it("should fail register with duplicate email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
    const testPassword = "TestPassword123!";

    // Register first
    await caller.auth.register({
      email: testEmail,
      password: testPassword,
    });

    // Try to register with same email
    try {
      await caller.auth.register({
        email: testEmail,
        password: "AnotherPassword123!",
      });
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.message).toContain("already registered");
    }
  });
});

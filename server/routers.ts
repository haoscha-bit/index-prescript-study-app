import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import { z } from "zod";
import { hash, verify } from "argon2";
import { TRPCError } from "@trpc/server";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }
        const passwordHash = await hash(input.password);
        const result = await db.createUser(input.email, passwordHash, input.name);
        const sessionToken = await sdk.createSessionToken(result.id.toString(), {
          name: input.name || input.email,
          expiresInMs: ONE_YEAR_MS,
        });
        return { success: true, sessionToken };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const isValidPassword = await verify(user.passwordHash, input.password);
        if (!isValidPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const sessionToken = await sdk.createSessionToken(user.id.toString(), {
          name: user.name || user.email,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user };
      }),
  }),

  // ─── Deck Procedures ────────────────────────────────────────────────────────
  decks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDecks(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ input, ctx }) => {
        return db.createDeck(ctx.user.id, input.name);
      }),
    rename: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(255) }))
      .mutation(async ({ input, ctx }) => {
        const deck = await db.getDeckById(input.id);
        if (!deck || deck.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Deck not found" });
        }
        await db.renameDeck(input.id, input.name);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const deck = await db.getDeckById(input.id);
        if (!deck || deck.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Deck not found" });
        }
        await db.deleteDeck(input.id);
        return { success: true };
      }),
  }),

  // ─── Prescript Procedures ──────────────────────────────────────────────────
  prescripts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPrescripts(ctx.user.id);
    }),
    listByDeck: protectedProcedure
      .input(z.object({ deckId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getPrescriptsByDeck(ctx.user.id, input.deckId);
      }),
    listUnassigned: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnassignedPrescripts(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        duration: z.number().min(1),
        category: z.string().optional(),
        description: z.string().optional(),
        deckId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createPrescript(
          ctx.user.id,
          input.name,
          input.duration,
          input.category,
          input.description,
          input.deckId,
        );
      }),
    updateDeck: protectedProcedure
      .input(z.object({
        id: z.number(),
        deckId: z.number().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const prescript = await db.getPrescriptById(input.id);
        if (!prescript || prescript.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Prescript not found" });
        }
        await db.updatePrescriptDeck(input.id, input.deckId);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const prescript = await db.getPrescriptById(input.id);
        if (!prescript || prescript.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Prescript not found" });
        }
        await db.deletePrescript(input.id);
        return { success: true };
      }),
  }),

  // ─── Session Procedures ────────────────────────────────────────────────────
  sessions: router({
    record: protectedProcedure
      .input(z.object({
        prescriptId: z.number(),
        status: z.enum(["completed", "failed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.recordSession(ctx.user.id, input.prescriptId, input.status);
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSessions(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;

import { describe, it, expect } from "vitest";
import { getRank, getRankInfo, RANKS } from "../shared/ranks";

describe("Rank System", () => {
  it("returns Uninitialized for 0 completions", () => {
    expect(getRank(0)).toBe("Uninitialized");
  });

  it("returns Proselyte I for 1 completion", () => {
    expect(getRank(1)).toBe("Proselyte I");
  });

  it("returns Proselyte I for 49 completions", () => {
    expect(getRank(49)).toBe("Proselyte I");
  });

  it("returns Proselyte II at exactly 50 completions", () => {
    expect(getRank(50)).toBe("Proselyte II");
  });

  it("returns Proselyte III at exactly 100 completions", () => {
    expect(getRank(100)).toBe("Proselyte III");
  });

  it("returns Proselyte III at 199 completions", () => {
    expect(getRank(199)).toBe("Proselyte III");
  });

  it("returns Sighted Proselyte I at exactly 200 completions", () => {
    expect(getRank(200)).toBe("Sighted Proselyte I");
  });

  it("returns Sighted Proselyte II at exactly 250 completions", () => {
    expect(getRank(250)).toBe("Sighted Proselyte II");
  });

  it("returns Sighted Proselyte III at exactly 300 completions", () => {
    expect(getRank(300)).toBe("Sighted Proselyte III");
  });

  it("returns Proxy I at exactly 400 completions", () => {
    expect(getRank(400)).toBe("Proxy I");
  });

  it("returns Proxy II at exactly 450 completions", () => {
    expect(getRank(450)).toBe("Proxy II");
  });

  it("returns Proxy III at exactly 500 completions", () => {
    expect(getRank(500)).toBe("Proxy III");
  });

  it("returns Messenger I at exactly 600 completions", () => {
    expect(getRank(600)).toBe("Messenger I");
  });

  it("returns Messenger II at exactly 650 completions", () => {
    expect(getRank(650)).toBe("Messenger II");
  });

  it("returns Messenger III at exactly 700 completions", () => {
    expect(getRank(700)).toBe("Messenger III");
  });

  it("returns Weaver I at exactly 800 completions", () => {
    expect(getRank(800)).toBe("Weaver I");
  });

  it("returns Weaver II at exactly 900 completions", () => {
    expect(getRank(900)).toBe("Weaver II");
  });

  it("returns Weaver III at exactly 1000 completions", () => {
    expect(getRank(1000)).toBe("Weaver III");
  });

  it("returns Weaver III for completions above 1000", () => {
    expect(getRank(1500)).toBe("Weaver III");
    expect(getRank(9999)).toBe("Weaver III");
  });

  it("has 15 ranks in RANKS array", () => {
    expect(RANKS.length).toBe(15);
  });

  it("RANKS thresholds are in ascending order", () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].threshold).toBeGreaterThan(RANKS[i - 1].threshold);
    }
  });

  it("each RANKS next points to the next rank threshold (except last)", () => {
    for (let i = 0; i < RANKS.length - 1; i++) {
      expect(RANKS[i].next).toBe(RANKS[i + 1].threshold);
    }
    expect(RANKS[RANKS.length - 1].next).toBeNull();
  });

  it("getRankInfo returns correct info for boundary values", () => {
    const info0 = getRankInfo(0);
    expect(info0.title).toBe("Proselyte I");
    expect(info0.next).toBe(50);

    const info800 = getRankInfo(800);
    expect(info800.title).toBe("Weaver I");
    expect(info800.next).toBe(900);

    const info1000 = getRankInfo(1000);
    expect(info1000.title).toBe("Weaver III");
    expect(info1000.next).toBeNull();
  });
});

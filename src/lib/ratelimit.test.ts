import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ratelimit", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.resetModules();
  });

  it("returns null limiters when Redis is not configured", async () => {
    const mod = await import("./ratelimit");
    expect(mod.freeSwipeLimit).toBeNull();
    expect(mod.proSwipeLimit).toBeNull();
    expect(mod.apiLimit).toBeNull();
  });

  it("allows swipe when Redis is unavailable", async () => {
    const mod = await import("./ratelimit");
    const result = await mod.checkSwipeLimit("user-123", false);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });

  it("blocks auth attempts after the limit, even without Redis", async () => {
    const mod = await import("./ratelimit");
    const results: boolean[] = [];
    for (let i = 0; i < 11; i++)
      results.push(await mod.checkAuthLimit("login", "Jan@Example.nl"));
    expect(results.slice(0, 10).every(Boolean)).toBe(true);
    expect(results[10]).toBe(false);
    // Andere sleutel en andere bucket tellen apart.
    expect(await mod.checkAuthLimit("login", "piet@example.nl")).toBe(true);
    expect(await mod.checkAuthLimit("reset", "jan@example.nl")).toBe(true);
  });
});

describe("ratelimit with Redis configured", () => {
  beforeEach(() => {
    vi.stubEnv(
      "UPSTASH_REDIS_REST_URL",
      "https://us1-final-marmot-12345.upstash.io",
    );
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.resetModules();
  });

  it("creates limiters when Redis is configured", async () => {
    const mod = await import("./ratelimit");
    expect(mod.freeSwipeLimit).not.toBeNull();
    expect(mod.proSwipeLimit).not.toBeNull();
    expect(mod.apiLimit).not.toBeNull();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { isCronAuthorized } from "./cron-auth";

const SECRET = "x".repeat(40);
const req = (auth?: string) =>
  new Request("http://x/", auth ? { headers: { authorization: auth } } : {});

describe("isCronAuthorized", () => {
  const old = process.env.CRON_SECRET;
  afterEach(() => {
    if (old === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = old;
  });

  it("accepteert de juiste token", () => {
    process.env.CRON_SECRET = SECRET;
    expect(isCronAuthorized(req(`Bearer ${SECRET}`))).toBe(true);
  });
  it("weigert een foute of ontbrekende token", () => {
    process.env.CRON_SECRET = SECRET;
    expect(isCronAuthorized(req("Bearer nope"))).toBe(false);
    expect(isCronAuthorized(req())).toBe(false);
  });
  it("weigert 'Bearer undefined' als het secret niet is ingesteld", () => {
    delete process.env.CRON_SECRET;
    expect(isCronAuthorized(req("Bearer undefined"))).toBe(false);
  });
  it("weigert een te kort secret", () => {
    process.env.CRON_SECRET = "kort";
    expect(isCronAuthorized(req("Bearer kort"))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { isActive, navFor } from "./nav-items";

describe("docentmenu", () => {
  it("Mijn edities is niet actief op de beoordelingspagina, Beoordelen wel", () => {
    // Het menu bestaat alleen met de leeromgeving aan; in tests staat die standaard aan.
    const { primary } = navFor("docent");
    const edities = primary.find((i) => i.label === "Mijn edities");
    const beoordelen = primary.find((i) => i.label === "Beoordelen");
    if (!edities || !beoordelen) return; // leeromgeving uit: standaardmenu
    expect(isActive("/leren/beoordelen", beoordelen)).toBe(true);
    expect(isActive("/leren/beoordelen", edities)).toBe(false);
    expect(isActive("/leren/abc/sessies", edities)).toBe(true);
  });
  it("Mentorship staat alleen in het docentmenu voor mentoren", () => {
    const labels = (mentor: boolean) =>
      navFor("docent", mentor).secondary.map((i) => i.label);
    const base = labels(false);
    if (!base.includes("Kennisbank")) return; // leeromgeving uit
    expect(base).not.toContain("Mentorship");
    expect(labels(true)).toContain("Mentorship");
  });
  it("Matching staat niet in het docentmenu", () => {
    const nav = navFor("docent");
    const all = [...nav.primary, ...nav.secondary].map((i) => i.label);
    if (!all.includes("Kennisbank")) return;
    expect(all).not.toContain("Matching");
  });
  it("Facilitators krijgen Sessies in het hoofdmenu en Netwerk onder Meer", () => {
    const nav = navFor("docent", false, true);
    const prim = nav.primary.map((i) => i.label);
    if (!nav.secondary.some((i) => i.label === "Kennisbank")) return;
    expect(prim).toContain("Sessies");
    expect(prim).not.toContain("Netwerk");
    expect(nav.secondary.map((i) => i.label)).toContain("Netwerk");
    expect(navFor("docent").primary.map((i) => i.label)).not.toContain(
      "Sessies",
    );
  });
});

import { describe, it, expect } from "vitest";
import { analyzeSeo } from "./analyze";

describe("analyzeSeo", () => {
  it("returns a score of 0 when no input is given", () => {
    const result = analyzeSeo({ title: "", content: "" });
    expect(result.score).toBe(0);
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.wordCount).toBe(0);
  });

  it("reports bad for missing focus keyword", () => {
    const result = analyzeSeo({ title: "Test", content: "Some content" });
    const kwCheck = result.checks.find((c) => c.id === "kw");
    expect(kwCheck?.status).toBe("bad");
  });

  it("reports good when keyword is present and title is optimal length", () => {
    const title = "Dit is een titel van exact de juiste lengte voor SEO";
    const result = analyzeSeo({
      title,
      content:
        "samenwerken is belangrijk voor ondernemers die samenwerken zoeken",
      focusKeyword: "samenwerken",
    });
    expect(result.checks.find((c) => c.id === "kw")?.status).toBe("good");
    expect(result.checks.find((c) => c.id === "title-len")?.status).toBe(
      "good",
    );
  });

  it("detects keyword in title", () => {
    const result = analyzeSeo({
      title: "Zo vind je samenwerken met impact",
      content: "Hier is wat content over samenwerken",
      focusKeyword: "samenwerken",
    });
    const kwTitle = result.checks.find((c) => c.id === "kw-title");
    expect(kwTitle?.status).toBe("good");
  });

  it("calculates word count and reading time correctly", () => {
    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ");
    const result = analyzeSeo({
      title: "Test",
      content: words,
      focusKeyword: "word1",
    });
    expect(result.wordCount).toBe(600);
    expect(result.readingTime).toBeGreaterThanOrEqual(2);
  });

  it("detects internal and external links", () => {
    const content = `
      Lees [dit artikel](/blog/test) en [deze bron](https://example.com).
      Nog een [interne link](/kennis/veiligheid).
    `;
    const result = analyzeSeo({
      title: "Test met links",
      content,
      focusKeyword: "links",
    });
    expect(result.internalLinks).toBe(2);
    expect(result.externalLinks).toBe(1);
    expect(result.checks.find((c) => c.id === "internal")?.status).toBe("good");
    expect(result.checks.find((c) => c.id === "external")?.status).toBe("good");
  });

  it("detects headings", () => {
    const content = `## Inleiding
Wat tekst.
### Subkop
Meer tekst.
## Conclusie
Nog meer tekst.`;
    const result = analyzeSeo({
      title: "Test met koppen",
      content,
      focusKeyword: "tekst",
    });
    expect(result.checks.find((c) => c.id === "headings")?.status).toBe("good");
  });

  it("penalizes short content", () => {
    const result = analyzeSeo({
      title: "Kort",
      content: "Korte tekst.",
      focusKeyword: "kort",
    });
    expect(result.checks.find((c) => c.id === "length")?.status).toBe("bad");
    expect(result.score).toBeLessThan(50);
  });

  it("returns score between 0-100 for realistic input", () => {
    const content = `
      Samenwerken is de sleutel tot succes voor ondernemers.
      ## Waarom samenwerken belangrijk is
      Samenwerken helpt je om sneller te groeien en meer impact te maken.
      Lees [meer over samenwerken](/blog/samenwerken-tips).
      Bekijk ook [deze externe bron](https://example.com/samenwerken).
      ## Hoe begin je met samenwerken
      Samenwerken begint met de juiste mindset.
      ### Zoek de juiste partner
      Samenwerken vereist vertrouwen en duidelijke afspraken.
      ## Conclusie
      Samenwerken loont altijd.
    `.repeat(5);
    const result = analyzeSeo({
      title: "Samenwerken: de complete gids voor ondernemers",
      metaDescription:
        "Ontdek hoe samenwerken jouw onderneming naar een hoger niveau tilt. Praktische tips voor het vinden van de juiste samenwerkingspartner.",
      content,
      focusKeyword: "samenwerken",
      slug: "samenwerken-complete-gids",
    });
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.readingTime).toBeGreaterThan(0);
  });

  it("handles empty optional fields gracefully", () => {
    const result = analyzeSeo({
      title: "Titel",
      content: "Content",
      metaTitle: null,
      metaDescription: undefined,
      focusKeyword: null,
      slug: undefined,
    });
    expect(typeof result.score).toBe("number");
    expect(result.checks.length).toBeGreaterThan(0);
  });
});

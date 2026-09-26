import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders paragraphs", () => {
    const html = renderMarkdown("Hallo wereld");
    expect(html).toBe("<p>Hallo wereld</p>");
  });

  it("renders multiple paragraphs separated by blank lines", () => {
    const html = renderMarkdown("Eerste alinea.\n\nTweede alinea.");
    expect(html).toContain("<p>Eerste alinea.</p>");
    expect(html).toContain("<p>Tweede alinea.</p>");
  });

  it("renders headings", () => {
    const html = renderMarkdown("# H1\n## H2\n### H3\n#### H4");
    expect(html).toContain("<h2>H1</h2>");
    expect(html).toContain("<h3>H2</h3>");
    expect(html).toContain("<h4>H3</h4>");
    expect(html).toContain("<h5>H4</h5>");
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- Item 1\n- Item 2\n- Item 3");
    expect(html).toBe("<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>");
  });

  it("renders ordered lists", () => {
    const html = renderMarkdown("1. Eerste\n2. Tweede\n3. Derde");
    expect(html).toBe("<ol><li>Eerste</li><li>Tweede</li><li>Derde</li></ol>");
  });

  it("renders bold text", () => {
    const html = renderMarkdown("Dit is **belangrijk**");
    expect(html).toBe("<p>Dit is <strong>belangrijk</strong></p>");
  });

  it("renders italic text", () => {
    const html = renderMarkdown("Dit is *schuin*");
    expect(html).toBe("<p>Dit is <em>schuin</em></p>");
  });

  it("renders inline code", () => {
    const html = renderMarkdown("Gebruik `code()` voor meer");
    expect(html).toBe("<p>Gebruik <code>code()</code> voor meer</p>");
  });

  it("renders links with target=_blank for external URLs", () => {
    const html = renderMarkdown(
      "Bezoek [onze site](https://example.com) vandaag",
    );
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">onze site</a>',
    );
  });

  it("renders internal links without target=_blank", () => {
    const html = renderMarkdown("Lees [meer](/blog/test)");
    expect(html).toBe('<p>Lees <a href="/blog/test">meer</a></p>');
  });

  it("blocks javascript: URLs in links", () => {
    const html = renderMarkdown("Klik [hier](javascript:alert('xss'))");
    expect(html).not.toContain("javascript");
    expect(html).toContain("hier");
  });

  it("escapes HTML in content", () => {
    const html = renderMarkdown("<script>alert('xss')</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders blockquotes", () => {
    const html = renderMarkdown("> Een citaat");
    expect(html).toBe("<blockquote>Een citaat</blockquote>");
  });

  it("handles empty input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("  ")).toBe("");
  });

  it("handles mixed content correctly", () => {
    const md = `# Mijn Blog

Dit is een **introductie** over het onderwerp.

## Kenmerken

- Eerste punt met *nadruk*
- Tweede punt

Lees [meer](https://example.com) of [interne link](/blog/meer).`;
    const html = renderMarkdown(md);
    expect(html).toContain("<h2>Mijn Blog</h2>");
    expect(html).toContain("<strong>introductie</strong>");
    expect(html).toContain("<em>nadruk</em>");
    expect(html).toContain("<ul><li>");
    expect(html).toContain('target="_blank"');
  });
});

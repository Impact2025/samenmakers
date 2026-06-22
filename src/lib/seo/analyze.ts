// World-class SEO analyzer — pure & isomorphic (runs live in the editor and
// server-side before save). Yoast-style checks producing a 0–100 score.

export type SeoCheckStatus = "good" | "ok" | "bad";

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoCheckStatus;
  message: string;
}

export interface SeoInput {
  title: string;
  metaTitle?: string | null | undefined;
  metaDescription?: string | null | undefined;
  excerpt?: string | null | undefined;
  content: string;
  focusKeyword?: string | null | undefined;
  slug?: string | null | undefined;
}

export interface SeoResult {
  score: number;
  checks: SeoCheck[];
  wordCount: number;
  readingTime: number;
  keywordDensity: number;
  internalLinks: number;
  externalLinks: number;
}

const WORDS_PER_MINUTE = 220;

function countWords(text: string): number {
  const stripped = text.replace(/[#*_>`\[\]()!-]/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle.trim()) return 0;
  const re = new RegExp(
    needle.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi",
  );
  return (haystack.match(re) ?? []).length;
}

export function analyzeSeo(input: SeoInput): SeoResult {
  const checks: SeoCheck[] = [];
  const content = input.content ?? "";
  const lower = content.toLowerCase();
  const keyword = (input.focusKeyword ?? "").trim().toLowerCase();
  const wordCount = countWords(content);
  const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

  const effectiveTitle = input.metaTitle?.trim() || input.title?.trim() || "";
  const metaDesc = input.metaDescription?.trim() ?? "";

  // Markdown link analysis
  const allLinks = [...content.matchAll(/\]\((https?:\/\/[^)]+|\/[^)]+)\)/g)].map(
    (m) => m[1] ?? "",
  );
  const externalLinks = allLinks.filter((u) => /^https?:\/\//.test(u)).length;
  const internalLinks = allLinks.filter((u) => u.startsWith("/")).length;
  const headings = (content.match(/^#{2,3}\s+/gm) ?? []).length;

  // Keyword density
  const keywordCount = keyword ? countOccurrences(lower, keyword) : 0;
  const keywordDensity =
    wordCount > 0 && keyword ? (keywordCount / wordCount) * 100 : 0;

  // --- Checks ---

  // 1. Focus keyword set
  checks.push(
    keyword
      ? { id: "kw", label: "Focus-keyword", status: "good", message: `Focus-keyword: "${keyword}".` }
      : { id: "kw", label: "Focus-keyword", status: "bad", message: "Geen focus-keyword ingesteld." },
  );

  // 2. Title length (50–60 ideal)
  const tLen = effectiveTitle.length;
  checks.push({
    id: "title-len",
    label: "Titel-lengte",
    status: tLen >= 40 && tLen <= 60 ? "good" : tLen >= 30 && tLen <= 70 ? "ok" : "bad",
    message: `${tLen} tekens (ideaal 50–60).`,
  });

  // 3. Keyword in title
  if (keyword) {
    const inTitle = effectiveTitle.toLowerCase().includes(keyword);
    checks.push({
      id: "kw-title",
      label: "Keyword in titel",
      status: inTitle ? "good" : "bad",
      message: inTitle ? "Keyword staat in de titel." : "Keyword ontbreekt in de titel.",
    });
  }

  // 4. Meta description length (120–158)
  checks.push({
    id: "meta-len",
    label: "Meta-description",
    status: metaDesc.length >= 120 && metaDesc.length <= 158 ? "good" : metaDesc.length >= 80 && metaDesc.length <= 170 ? "ok" : "bad",
    message: metaDesc ? `${metaDesc.length} tekens (ideaal 120–158).` : "Geen meta-description.",
  });

  // 5. Keyword in meta description
  if (keyword) {
    const inMeta = metaDesc.toLowerCase().includes(keyword);
    checks.push({
      id: "kw-meta",
      label: "Keyword in meta",
      status: inMeta ? "good" : "ok",
      message: inMeta ? "Keyword staat in de meta-description." : "Keyword niet in meta-description.",
    });
  }

  // 6. Word count (≥600 good)
  checks.push({
    id: "length",
    label: "Tekstlengte",
    status: wordCount >= 600 ? "good" : wordCount >= 300 ? "ok" : "bad",
    message: `${wordCount} woorden (≥600 aanbevolen).`,
  });

  // 7. Keyword density (0.5–2.5% ideal)
  if (keyword) {
    checks.push({
      id: "density",
      label: "Keyword-dichtheid",
      status: keywordDensity >= 0.5 && keywordDensity <= 2.5 ? "good" : keywordDensity > 0 && keywordDensity <= 3.5 ? "ok" : "bad",
      message: `${keywordDensity.toFixed(1)}% (ideaal 0,5–2,5%).`,
    });
  }

  // 8. Subheadings
  checks.push({
    id: "headings",
    label: "Tussenkoppen (H2/H3)",
    status: headings >= 3 ? "good" : headings >= 1 ? "ok" : "bad",
    message: `${headings} koppen gevonden (≥3 aanbevolen).`,
  });

  // 9. Internal links
  checks.push({
    id: "internal",
    label: "Interne links",
    status: internalLinks >= 2 ? "good" : internalLinks >= 1 ? "ok" : "bad",
    message: `${internalLinks} interne link(s) (≥2 aanbevolen).`,
  });

  // 10. External links
  checks.push({
    id: "external",
    label: "Externe links",
    status: externalLinks >= 1 ? "good" : "bad",
    message: `${externalLinks} externe link(s) (≥1 aanbevolen).`,
  });

  // 11. Keyword in first paragraph
  if (keyword) {
    const firstChunk = lower.slice(0, 200);
    const early = firstChunk.includes(keyword);
    checks.push({
      id: "kw-intro",
      label: "Keyword in intro",
      status: early ? "good" : "ok",
      message: early ? "Keyword staat vroeg in de tekst." : "Keyword niet in de eerste 200 tekens.",
    });
  }

  // 12. Slug quality
  const slug = (input.slug ?? "").trim();
  if (slug) {
    const slugOk = keyword ? slug.includes(keyword.replace(/\s+/g, "-")) : slug.length > 0;
    checks.push({
      id: "slug",
      label: "URL-slug",
      status: slugOk ? "good" : "ok",
      message: slugOk ? "Keyword in de URL-slug." : "Keyword niet in de slug.",
    });
  }

  // Score: weighted by status
  const weight = { good: 1, ok: 0.5, bad: 0 } as const;
  const score = Math.round(
    (checks.reduce((s, c) => s + weight[c.status], 0) / checks.length) * 100,
  );

  return {
    score,
    checks,
    wordCount,
    readingTime,
    keywordDensity: Math.round(keywordDensity * 10) / 10,
    internalLinks,
    externalLinks,
  };
}

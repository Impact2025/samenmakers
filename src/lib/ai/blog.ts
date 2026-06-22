import "server-only";
import { chatCompletion } from "@/lib/ai/openrouter";

export interface BlogDraft {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  keywords: string[];
  content: string; // Markdown
  internalLinks: Array<{ anchor: string; slug: string }>;
  externalLinks: Array<{ anchor: string; url: string }>;
  faq: Array<{ question: string; answer: string }>;
}

export interface GenerateBlogInput {
  topic: string;
  focusKeyword: string;
  category: "blog" | "kennisbank" | "tool" | "funding";
  /** Existing published posts so the model can suggest real internal links. */
  existingPosts: Array<{ title: string; slug: string }>;
  tone?: string | undefined;
}

function extractJson(raw: string): unknown {
  // Models sometimes wrap JSON in ```json fences or prose.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Geen JSON in AI-respons");
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Generates a complete, SEO-optimised blog draft in Dutch via OpenRouter.
 * Returns null when AI is not configured.
 */
export async function generateBlogDraft(
  input: GenerateBlogInput,
): Promise<BlogDraft | null> {
  const internalLinkList = input.existingPosts.length
    ? input.existingPosts
        .map((p) => `- "${p.title}" → /kennis/${p.slug}`)
        .join("\n")
    : "(nog geen bestaande artikelen — verwijs niet naar interne links)";

  const system = `Je bent een Nederlandse SEO-copywriter van wereldklasse voor Samenmakers,
een platform voor impact-ondernemers. Je schrijft heldere, autoritaire, E-E-A-T-waardige
artikelen die hoog ranken in Google. Je antwoordt UITSLUITEND met geldige JSON, zonder
extra uitleg en zonder markdown-codefences.`;

  const user = `Schrijf een SEO-geoptimaliseerd artikel.

Onderwerp: ${input.topic}
Focus-keyword: ${input.focusKeyword}
Categorie: ${input.category}
Toon: ${input.tone ?? "professioneel, toegankelijk, activerend"}

Bestaande artikelen om relevant intern naar te linken:
${internalLinkList}

Eisen:
- 800–1200 woorden, in het Nederlands.
- Inhoud in Markdown met een pakkende intro, minimaal 4 H2-koppen (##) en waar nuttig H3 (###).
- Gebruik het focus-keyword natuurlijk in de eerste alinea, in minstens één kop en met een dichtheid van ~1%.
- Verwerk 2–4 INTERNE links naar bovenstaande artikelen (Markdown: [anchor](/kennis/slug)) waar contextueel relevant.
- Verwerk 1–3 AUTORITAIRE EXTERNE links naar betrouwbare bronnen (officiële instanties, onderzoek) als Markdown.
- Eindig met een korte conclusie/call-to-action.
- meta_title: 50–60 tekens, bevat het keyword.
- meta_description: 120–158 tekens, bevat het keyword, wervend.
- excerpt: 1–2 zinnen.
- keywords: 4–8 relevante secundaire keywords.
- faq: 2–4 relevante vraag/antwoord-paren voor een FAQ-schema.

Antwoord met exact dit JSON-schema:
{
  "title": string,
  "metaTitle": string,
  "metaDescription": string,
  "excerpt": string,
  "keywords": string[],
  "content": string,
  "internalLinks": [{ "anchor": string, "slug": string }],
  "externalLinks": [{ "anchor": string, "url": string }],
  "faq": [{ "question": string, "answer": string }]
}`;

  const raw = await chatCompletion({
    system,
    user,
    maxTokens: 4000,
    temperature: 0.6,
  });
  if (!raw) return null;

  const parsed = extractJson(raw) as Partial<BlogDraft>;
  return {
    title: parsed.title ?? input.topic,
    metaTitle: parsed.metaTitle ?? parsed.title ?? input.topic,
    metaDescription: parsed.metaDescription ?? "",
    excerpt: parsed.excerpt ?? "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    content: parsed.content ?? "",
    internalLinks: Array.isArray(parsed.internalLinks) ? parsed.internalLinks : [],
    externalLinks: Array.isArray(parsed.externalLinks) ? parsed.externalLinks : [],
    faq: Array.isArray(parsed.faq) ? parsed.faq : [],
  };
}

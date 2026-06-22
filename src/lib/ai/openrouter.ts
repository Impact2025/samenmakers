import "server-only";

/**
 * Thin wrapper around the OpenRouter chat-completions API (OpenAI-compatible).
 * Returns null when no key is configured so callers can degrade gracefully.
 */
export async function chatCompletion(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.6";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://samenmakers.nl";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // OpenRouter attribution headers (optional but recommended).
        "HTTP-Referer": appUrl,
        "X-Title": "Samenmakers Admin",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        max_tokens: opts.maxTokens ?? 700,
        temperature: opts.temperature ?? 0.4,
      }),
    });

    if (!res.ok) {
      console.error(`[openrouter] ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("[openrouter] request failed", err);
    return null;
  }
}

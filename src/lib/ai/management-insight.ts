import "server-only";
import { chatCompletion } from "@/lib/ai/openrouter";
import type { PlatformMetrics } from "@/server/admin/metrics";

/**
 * Asks the LLM (via OpenRouter) to turn raw KPIs into a short Dutch
 * management narrative: what stands out + 3 concrete recommendations.
 * Returns null if AI is unavailable so the email still sends without it.
 */
export async function generateManagementInsight(
  metrics: PlatformMetrics,
): Promise<string | null> {
  const system =
    "Je bent een ervaren data-analist en groeistrateeg voor Samenmakers, " +
    "een Nederlands platform dat impact-ondernemers met elkaar matcht. " +
    "Je schrijft beknopt, zakelijk en in het Nederlands. Geen markdown-koppen, " +
    "gebruik korte alinea's en eventueel een genummerde lijst.";

  const user = `Hier zijn de platform-KPI's over de ${metrics.windowLabel}:

${JSON.stringify(metrics, null, 2)}

Schrijf een korte management-analyse (max ~180 woorden) met:
1. Wat valt op (positief én aandachtspunten, met de belangrijkste cijfers).
2. Drie concrete, prioriteerde aanbevelingen voor deze periode.
Wees specifiek en verwijs naar de cijfers.`;

  return chatCompletion({ system, user, maxTokens: 600, temperature: 0.4 });
}

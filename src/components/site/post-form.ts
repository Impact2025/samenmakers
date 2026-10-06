export type SiteFormKind = "samenwerken" | "interesse";

export async function postSiteForm(
  kind: SiteFormKind,
  data: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const generic = "Er is iets misgegaan. Probeer het later opnieuw.";
  try {
    const res = await fetch("/api/site/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...Object.fromEntries(data) }),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return { ok: false, error: body?.error ?? generic };
  } catch {
    return { ok: false, error: generic };
  }
}

// Adres → coördinaten via de PDOK Locatieserver (gratis, geen sleutel, NL-dekking).
// Fail-soft: zonder resultaat blijft het event gewoon werken, alleen zonder kaart/afstand.

const PDOK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

export function parsePoint(
  wkt: string,
): { latitude: number; longitude: number } | null {
  const m = /POINT\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/.exec(wkt);
  if (!m) return null;
  return { longitude: Number(m[1]), latitude: Number(m[2]) };
}

export async function geocode(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const q = query.trim();
  if (q.length < 3) return null;
  try {
    const url = `${PDOK}?q=${encodeURIComponent(q)}&rows=1&fl=centroide_ll`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      response?: { docs?: { centroide_ll?: string }[] };
    };
    const point = data.response?.docs?.[0]?.centroide_ll;
    return point ? parsePoint(point) : null;
  } catch {
    return null;
  }
}

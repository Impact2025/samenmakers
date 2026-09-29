// Gedeelde validatie voor beelduploads. Uploads worden als publieke blob geserveerd, dus
// alleen echte JPG/PNG/WebP: een willekeurig type (HTML, SVG) zou een XSS-risico zijn.
// We vertrouwen `file.type` (door de client opgegeven) niet en controleren de magic bytes.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SIGNATURES: {
  type: "image/jpeg" | "image/png" | "image/webp";
  ext: string;
  test: (b: Uint8Array) => boolean;
}[] = [
  {
    type: "image/jpeg",
    ext: "jpg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    type: "image/png",
    ext: "png",
    test: (b) =>
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (v, i) => b[i] === v,
      ),
  },
  {
    type: "image/webp",
    ext: "webp",
    // "RIFF" .... "WEBP"
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

export type ImageCheck =
  | { ok: true; contentType: string; ext: string }
  | { ok: false; error: string };

export function sniffImage(
  bytes: Uint8Array,
): { contentType: string; ext: string } | null {
  const hit = SIGNATURES.find((s) => s.test(bytes));
  return hit ? { contentType: hit.type, ext: hit.ext } : null;
}

export async function validateImage(
  file: unknown,
  maxBytes = MAX_IMAGE_BYTES,
): Promise<ImageCheck> {
  if (!(file instanceof File))
    return { ok: false, error: "Geen bestand meegegeven" };
  if (file.size === 0) return { ok: false, error: "Leeg bestand" };
  if (file.size > maxBytes)
    return {
      ok: false,
      error: `Maximaal ${Math.round(maxBytes / 1024 / 1024)} MB`,
    };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffImage(head);
  if (!sniffed) return { ok: false, error: "Alleen JPG, PNG of WebP" };
  return { ok: true, ...sniffed };
}

// Documenten (huiswerk, docentmateriaal): afbeeldingen, PDF en Office-bestanden.
// Type en extensie komen uit de inhoud (en voor Office uit een vaste lijst extensies),
// nooit uit het door de client opgegeven type. HTML/SVG/scripts blijven geweigerd.

export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

const OFFICE_TYPES: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export type DocumentCheck =
  | { ok: true; contentType: string; ext: string }
  | { ok: false; error: string };

export function sniffDocument(
  bytes: Uint8Array,
  fileName: string,
): { contentType: string; ext: string } | null {
  const image = sniffImage(bytes);
  if (image) return image;
  // "%PDF"
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
    return { contentType: "application/pdf", ext: "pdf" };
  // Office Open XML is een zip ("PK\x03\x04"); het soort volgt uit een toegestane extensie.
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = OFFICE_TYPES[ext];
    if (contentType) return { contentType, ext };
  }
  return null;
}

export async function validateDocument(
  file: unknown,
  maxBytes = MAX_DOCUMENT_BYTES,
): Promise<DocumentCheck> {
  if (!(file instanceof File))
    return { ok: false, error: "Geen bestand meegegeven" };
  if (file.size === 0) return { ok: false, error: "Leeg bestand" };
  if (file.size > maxBytes)
    return {
      ok: false,
      error: `Maximaal ${Math.round(maxBytes / 1024 / 1024)} MB`,
    };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffDocument(head, file.name);
  if (!sniffed)
    return {
      ok: false,
      error: "Alleen JPG, PNG, WebP, PDF, Word, PowerPoint of Excel",
    };
  return { ok: true, ...sniffed };
}

/** Bestanden die via onze uploadroutes zijn opgeslagen staan op Vercel Blob. */
export function isBlobUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

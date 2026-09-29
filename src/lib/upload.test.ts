import { describe, it, expect } from "vitest";
import {
  isBlobUrl,
  sniffDocument,
  sniffImage,
  validateDocument,
  validateImage,
} from "./upload";

const png = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);
const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);
const html = new TextEncoder().encode("<html><script>alert(1)</script>");
const svg = new TextEncoder().encode(
  '<svg xmlns="http://www.w3.org/2000/svg">',
);

describe("sniffImage", () => {
  it("herkent echte afbeeldingen", () => {
    expect(sniffImage(png)?.contentType).toBe("image/png");
    expect(sniffImage(jpg)?.contentType).toBe("image/jpeg");
    expect(sniffImage(webp)?.contentType).toBe("image/webp");
  });

  it("weigert HTML en SVG", () => {
    expect(sniffImage(html)).toBeNull();
    expect(sniffImage(svg)).toBeNull();
  });
});

describe("validateImage", () => {
  it("negeert een vervalst content-type", async () => {
    const fake = new File([html], "avatar.png", { type: "image/png" });
    expect(await validateImage(fake)).toEqual({
      ok: false,
      error: "Alleen JPG, PNG of WebP",
    });
  });

  it("accepteert een PNG en bepaalt zelf de extensie", async () => {
    const file = new File([png], "evil.html", { type: "text/html" });
    expect(await validateImage(file)).toEqual({
      ok: true,
      contentType: "image/png",
      ext: "png",
    });
  });

  it("weigert te grote bestanden", async () => {
    const file = new File([png], "a.png", { type: "image/png" });
    expect((await validateImage(file, 4)).ok).toBe(false);
  });

  it("weigert iets anders dan een bestand", async () => {
    expect((await validateImage("nope")).ok).toBe(false);
  });
});

describe("sniffDocument", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7\n");
  const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);

  it("herkent afbeeldingen en PDF", () => {
    expect(sniffDocument(png, "x.png")?.contentType).toBe("image/png");
    expect(sniffDocument(pdf, "x.pdf")?.contentType).toBe("application/pdf");
  });

  it("herkent Office alleen met een toegestane extensie", () => {
    expect(sniffDocument(zip, "slides.pptx")?.ext).toBe("pptx");
    expect(sniffDocument(zip, "SLIDES.PPTX")?.ext).toBe("pptx");
    expect(sniffDocument(zip, "archief.zip")).toBeNull();
    expect(sniffDocument(zip, "geen-extensie")).toBeNull();
  });

  it("weigert HTML en SVG, ook met een onschuldige naam", () => {
    expect(sniffDocument(html, "x.pdf")).toBeNull();
    expect(sniffDocument(svg, "x.png")).toBeNull();
  });
});

describe("validateDocument", () => {
  it("negeert een vervalst content-type", async () => {
    const fake = new File([html], "x.pdf", { type: "application/pdf" });
    expect((await validateDocument(fake)).ok).toBe(false);
  });

  it("accepteert een echte PDF en bepaalt het type zelf", async () => {
    const real = new File(["%PDF-1.7\n"], "x.bin", { type: "text/html" });
    const r = await validateDocument(real);
    expect(r).toEqual({ ok: true, contentType: "application/pdf", ext: "pdf" });
  });

  it("weigert te grote en lege bestanden", async () => {
    expect((await validateDocument(new File([], "x.pdf"))).ok).toBe(false);
    const big = new File(["%PDF-1.7\n"], "x.pdf");
    expect((await validateDocument(big, 4)).ok).toBe(false);
  });
});

describe("isBlobUrl", () => {
  it("laat alleen onze blob-opslag door", () => {
    expect(isBlobUrl("https://abc.public.blob.vercel-storage.com/a.png")).toBe(
      true,
    );
    expect(isBlobUrl("http://abc.public.blob.vercel-storage.com/a.png")).toBe(
      false,
    );
    expect(isBlobUrl("https://evil.example/a.png")).toBe(false);
    expect(
      isBlobUrl("https://evil.example/?x=.public.blob.vercel-storage.com"),
    ).toBe(false);
    expect(isBlobUrl("javascript:alert(1)")).toBe(false);
  });
});

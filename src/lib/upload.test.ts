import { describe, it, expect } from "vitest";
import { sniffImage, validateImage } from "./upload";

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

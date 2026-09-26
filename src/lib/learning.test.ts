import { describe, it, expect } from "vitest";
import {
  computeProgress,
  findNextLesson,
  generateInviteCode,
  isCompletionMet,
  moduleWindow,
  shiftEditionDates,
  toEmbedUrl,
  type ProgressStatus,
} from "./learning";

const lessons = [
  { id: "a", isRequired: true },
  { id: "b", isRequired: true },
  { id: "c", isRequired: false },
  { id: "d", isRequired: true },
];

describe("computeProgress", () => {
  it("counts only required lessons", () => {
    const status = new Map<string, ProgressStatus>([
      ["a", "klaar"],
      ["c", "klaar"],
      ["b", "bezig"],
    ]);
    expect(computeProgress(lessons, status)).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    });
  });

  it("falls back to all lessons when none are required", () => {
    const optional = lessons.map((l) => ({ ...l, isRequired: false }));
    const status = new Map<string, ProgressStatus>([["c", "klaar"]]);
    expect(computeProgress(optional, status)).toEqual({
      done: 1,
      total: 4,
      percent: 25,
    });
  });

  it("returns 0% for an empty curriculum", () => {
    expect(computeProgress([], new Map())).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    });
  });
});

describe("findNextLesson", () => {
  it("returns the first unfinished lesson in order", () => {
    const status = new Map<string, ProgressStatus>([
      ["a", "klaar"],
      ["b", "bezig"],
    ]);
    expect(findNextLesson(lessons, status)?.id).toBe("b");
  });

  it("returns null when everything is done", () => {
    const status = new Map<string, ProgressStatus>(
      lessons.map((l) => [l.id, "klaar"]),
    );
    expect(findNextLesson(lessons, status)).toBeNull();
  });
});

describe("moduleWindow / shiftEditionDates", () => {
  it("computes absolute dates from offsets", () => {
    const start = new Date("2026-09-01T09:00:00Z");
    const w = moduleWindow(start, 7, 20);
    expect(w.start?.toISOString().slice(0, 10)).toBe("2026-09-08");
    expect(w.end?.toISOString().slice(0, 10)).toBe("2026-09-21");
    expect(moduleWindow(null, 7, 20)).toEqual({ start: null, end: null });
  });

  it("keeps the edition length when shifting", () => {
    const r = shiftEditionDates(
      new Date("2026-02-01T00:00:00Z"),
      new Date("2026-03-01T00:00:00Z"),
      new Date("2026-09-01T00:00:00Z"),
    );
    expect(r.endDate?.toISOString().slice(0, 10)).toBe("2026-09-29");
  });
});

describe("isCompletionMet", () => {
  it("defaults to 100%", () => {
    expect(isCompletionMet({ done: 2, total: 3, percent: 67 }, null)).toBe(
      false,
    );
    expect(isCompletionMet({ done: 3, total: 3, percent: 100 }, null)).toBe(
      true,
    );
  });
  it("respects a lower threshold", () => {
    expect(
      isCompletionMet(
        { done: 2, total: 3, percent: 67 },
        { minLessonPercent: 60 },
      ),
    ).toBe(true);
  });
  it("never completes an empty curriculum", () => {
    expect(
      isCompletionMet(
        { done: 0, total: 0, percent: 0 },
        { minLessonPercent: 0 },
      ),
    ).toBe(false);
  });
});

describe("toEmbedUrl", () => {
  it.each([
    [
      "https://www.youtube.com/watch?v=abc123",
      "https://www.youtube-nocookie.com/embed/abc123",
    ],
    [
      "https://youtu.be/abc123?t=10",
      "https://www.youtube-nocookie.com/embed/abc123",
    ],
    [
      "https://youtube.com/shorts/xyz_9",
      "https://www.youtube-nocookie.com/embed/xyz_9",
    ],
    ["https://vimeo.com/76979871", "https://player.vimeo.com/video/76979871"],
    [
      "https://player.vimeo.com/video/76979871",
      "https://player.vimeo.com/video/76979871",
    ],
  ])("%s", (input, expected) => {
    expect(toEmbedUrl(input)).toBe(expected);
  });

  it("rejects unknown hosts and bad input", () => {
    expect(toEmbedUrl("https://example.com/video.mp4")).toBeNull();
    expect(toEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(toEmbedUrl("not a url")).toBeNull();
    expect(toEmbedUrl(undefined)).toBeNull();
  });
});

describe("generateInviteCode", () => {
  it("creates 8-char codes without ambiguous characters", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });
});

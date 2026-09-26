// Pure helpers for the leeromgeving (no DB access), shared by routers and UI.

export type ProgressStatus = "bezig" | "klaar";

export interface LessonRef {
  id: string;
  isRequired: boolean;
}

export interface Progress {
  done: number;
  total: number;
  percent: number;
}

/**
 * Progress over required lessons. When a program marks nothing as required,
 * every lesson counts, so the bar still means something.
 */
export function computeProgress(
  lessons: LessonRef[],
  statusByLesson: Map<string, ProgressStatus>,
): Progress {
  const required = lessons.filter((l) => l.isRequired);
  const counted = required.length > 0 ? required : lessons;
  const done = counted.filter(
    (l) => statusByLesson.get(l.id) === "klaar",
  ).length;
  const total = counted.length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/**
 * The lesson a learner should open next: the first lesson in curriculum
 * order that isn't finished yet. Returns null when everything is done.
 */
export function findNextLesson<T extends { id: string }>(
  orderedLessons: T[],
  statusByLesson: Map<string, ProgressStatus>,
): T | null {
  return (
    orderedLessons.find((l) => statusByLesson.get(l.id) !== "klaar") ?? null
  );
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Absolute dates of a module inside an edition, from its relative offsets. */
export function moduleWindow(
  cohortStart: Date | null,
  startOffsetDays: number | null,
  endOffsetDays: number | null,
): { start: Date | null; end: Date | null } {
  if (!cohortStart) return { start: null, end: null };
  return {
    start:
      startOffsetDays == null ? null : addDays(cohortStart, startOffsetDays),
    end: endOffsetDays == null ? null : addDays(cohortStart, endOffsetDays),
  };
}

/** Shift an edition's dates so a copy starts on `newStart`. */
export function shiftEditionDates(
  oldStart: Date | null,
  oldEnd: Date | null,
  newStart: Date,
): { startDate: Date; endDate: Date | null } {
  if (!oldStart || !oldEnd) return { startDate: newStart, endDate: null };
  const lengthMs = oldEnd.getTime() - oldStart.getTime();
  return {
    startDate: newStart,
    endDate: new Date(newStart.getTime() + lengthMs),
  };
}

export function isCompletionMet(
  progress: Progress,
  rules: { minLessonPercent?: number } | null | undefined,
): boolean {
  const min = rules?.minLessonPercent ?? 100;
  return progress.total > 0 && progress.percent >= min;
}

/**
 * Turn a YouTube or Vimeo page URL into an embeddable player URL.
 * Anything else returns null so the UI can fall back to a plain link.
 */
export function toEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    const m = /^\/(embed|shorts|live)\/([\w-]+)/.exec(url.pathname);
    return m ? `https://www.youtube-nocookie.com/embed/${m[2]}` : null;
  }
  if (host === "vimeo.com") {
    const m = /^\/(\d+)/.exec(url.pathname);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }
  if (host === "player.vimeo.com") {
    const m = /^\/video\/(\d+)/.exec(url.pathname);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }
  return null;
}

/** 8-char code without look-alike characters (0/O, 1/I). */
export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const LESSON_TYPE_LABELS: Record<string, string> = {
  tekst: "Tekst",
  video: "Video",
  bestand: "Bestand",
  reflectie: "Reflectie",
  live: "Live sessie",
};

export const COHORT_ROLE_LABELS: Record<string, string> = {
  cursist: "Cursist",
  docent: "Docent",
  manager: "Programmamanager",
  alumnus: "Alumnus",
};

export const COHORT_STATUS_LABELS: Record<string, string> = {
  concept: "Concept",
  open: "Open voor inschrijving",
  lopend: "Lopend",
  afgerond: "Afgerond",
};

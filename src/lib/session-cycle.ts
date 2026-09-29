// Pure planningsregels voor de leergangcyclus rond één sessie (geen DB, getest in session-cycle.test.ts).
// Afspraken uit het klantgesprek: briefing 3 weken vooraf, huiswerkmail en docenttoegang 2 weken vooraf,
// huiswerk 3 dagen vooraf inleveren, docenttoegang tot 2 weken na de sessie.

const DAY = 86_400_000;

export const BRIEFING_DAYS_BEFORE = 21;
export const HOMEWORK_MAIL_DAYS_BEFORE = 14;
export const HOMEWORK_DUE_DAYS_BEFORE = 3;
export const TEACHER_ACCESS_DAYS_BEFORE = 14;
export const TEACHER_ACCESS_DAYS_AFTER = 14;

function shift(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY);
}

export interface SessionCycle {
  briefingAt: Date;
  homeworkMailAt: Date;
  homeworkDueAt: Date;
  teacherAccessFrom: Date;
  teacherAccessUntil: Date;
}

export function sessionCycle(sessionStart: Date): SessionCycle {
  return {
    briefingAt: shift(sessionStart, -BRIEFING_DAYS_BEFORE),
    homeworkMailAt: shift(sessionStart, -HOMEWORK_MAIL_DAYS_BEFORE),
    homeworkDueAt: shift(sessionStart, -HOMEWORK_DUE_DAYS_BEFORE),
    teacherAccessFrom: shift(sessionStart, -TEACHER_ACCESS_DAYS_BEFORE),
    teacherAccessUntil: shift(sessionStart, TEACHER_ACCESS_DAYS_AFTER),
  };
}

/**
 * Toegangsvenster van een docent over al zijn sessies in een editie:
 * van twee weken voor de eerste tot twee weken na de laatste sessie.
 * Zonder sessies is er geen venster (null).
 */
export function teacherWindow(
  sessionStarts: Date[],
): { from: Date; until: Date } | null {
  if (sessionStarts.length === 0) return null;
  const times = sessionStarts.map((d) => d.getTime());
  return {
    from: shift(new Date(Math.min(...times)), -TEACHER_ACCESS_DAYS_BEFORE),
    until: shift(new Date(Math.max(...times)), TEACHER_ACCESS_DAYS_AFTER),
  };
}

/** Null-grens betekent onbegrensd (facilitators, cursisten, handmatig aangemaakte docenten). */
export function withinAccessWindow(
  window: { from: Date | null; until: Date | null },
  now: Date,
): boolean {
  if (window.from && now < window.from) return false;
  if (window.until && now > window.until) return false;
  return true;
}

export type CyclePhase =
  | "voorbereiding"
  | "briefing"
  | "huiswerk"
  | "inleverdeadline"
  | "sessie"
  | "nazorg"
  | "afgerond";

/** In welke fase van de cyclus zit deze sessie nu? Handig voor het facilitatorscherm. */
export function cyclePhase(sessionStart: Date, now: Date): CyclePhase {
  const c = sessionCycle(sessionStart);
  if (now < c.briefingAt) return "voorbereiding";
  if (now < c.homeworkMailAt) return "briefing";
  if (now < c.homeworkDueAt) return "huiswerk";
  if (now < sessionStart) return "inleverdeadline";
  if (now < shift(sessionStart, 1)) return "sessie";
  if (now <= c.teacherAccessUntil) return "nazorg";
  return "afgerond";
}

/**
 * Welke mailmomenten zijn aan de beurt? Cron draait dagelijks en verstuurt wat
 * nu verschuldigd is en nog niet verstuurd; een gemiste dag haalt zichzelf dus in.
 */
export function dueMailings(
  sessionStart: Date,
  sent: { briefingSentAt: Date | null; homeworkMailSentAt: Date | null },
  now: Date,
): ("briefing" | "huiswerk")[] {
  if (now >= sessionStart) return [];
  const c = sessionCycle(sessionStart);
  const due: ("briefing" | "huiswerk")[] = [];
  if (!sent.briefingSentAt && now >= c.briefingAt) due.push("briefing");
  if (!sent.homeworkMailSentAt && now >= c.homeworkMailAt) due.push("huiswerk");
  return due;
}

/** Een inlevering telt als te laat na de deadline (3 dagen voor de sessie, of eigen deadline). */
export function isLate(submittedAt: Date, dueAt: Date | null): boolean {
  return dueAt !== null && submittedAt > dueAt;
}

export const PHASE_LABEL: Record<CyclePhase, string> = {
  voorbereiding: "Voorbereiding",
  briefing: "Docentbriefing",
  huiswerk: "Huiswerk open",
  inleverdeadline: "Deadline verstreken",
  sessie: "Sessie vandaag",
  nazorg: "Nazorg",
  afgerond: "Afgerond",
};

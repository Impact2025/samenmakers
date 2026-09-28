// Pure helpers voor het docentdashboard (geen DB), gedeeld door router en tests.
import { moduleWindow } from "@/lib/learning";

export type LearnerSignal = "klaar" | "op_schema" | "achter" | "inactief";

interface ModuleWithLessons {
  startOffsetDays: number | null;
  endOffsetDays: number | null;
  lessons: { id: string; isRequired: boolean }[];
}

/**
 * Verplichte lessen waarvan de module al voorbij zou moeten zijn.
 * Modules zonder einddatum of een editie zonder startdatum tellen niet mee.
 */
export function dueLessonIds(
  modules: ModuleWithLessons[],
  cohortStart: Date | null,
  now: Date,
): string[] {
  const ids: string[] = [];
  const anyRequired = modules.some((m) => m.lessons.some((l) => l.isRequired));
  for (const m of modules) {
    const { end } = moduleWindow(
      cohortStart,
      m.startOffsetDays,
      m.endOffsetDays,
    );
    if (!end || end > now) continue;
    for (const l of m.lessons) if (!anyRequired || l.isRequired) ids.push(l.id);
  }
  return ids;
}

export const INACTIVE_AFTER_DAYS = 14;

/** Eén duidelijk signaal per cursist: inactief weegt zwaarder dan achterlopen. */
export function learnerSignal(input: {
  percent: number;
  doneLessonIds: Set<string>;
  dueIds: string[];
  inactiveDays: number;
  status: string;
}): LearnerSignal {
  if (input.percent >= 100) return "klaar";
  if (input.status !== "actief") return "op_schema";
  if (input.inactiveDays >= INACTIVE_AFTER_DAYS) return "inactief";
  const missed = input.dueIds.filter(
    (id) => !input.doneLessonIds.has(id),
  ).length;
  return missed > 0 ? "achter" : "op_schema";
}

export const SIGNAL_LABEL: Record<LearnerSignal, string> = {
  klaar: "Afgerond",
  op_schema: "Op schema",
  achter: "Loopt achter",
  inactief: "Inactief",
};

// Pure regels: wie mag welk bestand downloaden (geen DB, getest in file-access.test.ts).
// Huiswerk en lesmateriaal bevatten vertrouwelijke bedrijfsinformatie. De bestanden zelf zijn
// niet publiek; de downloadroute controleert per verzoek aan de hand van deze regels.

import type { Person } from "@/lib/access";
import { canViewLibrary } from "@/lib/access";
import { withinAccessWindow } from "@/lib/session-cycle";

const STAFF_ROLES = ["docent", "facilitator", "manager"];

export interface CohortSeat {
  role: "cursist" | "docent" | "manager" | "alumnus" | "facilitator";
  status: "actief" | "gepauzeerd" | "afgerond" | "uitgeschreven";
  accessFrom: Date | null;
  accessUntil: Date | null;
}

/** Staf van de editie: docent (alleen binnen het toegangsvenster), facilitator of manager. */
export function isActiveStaff(seat: CohortSeat | null, now: Date): boolean {
  if (!seat || seat.status === "uitgeschreven") return false;
  if (!STAFF_ROLES.includes(seat.role)) return false;
  return withinAccessWindow(
    { from: seat.accessFrom, until: seat.accessUntil },
    now,
  );
}

/** Inleveringen: de cursist zelf, de staf van die editie en beheerders. Niemand anders. */
export function canDownloadSubmissionFile(args: {
  isAdmin: boolean;
  userId: string;
  ownerId: string;
  seat: CohortSeat | null;
  now: Date;
}): boolean {
  if (args.isAdmin) return true;
  if (args.userId === args.ownerId) return true;
  return isActiveStaff(args.seat, args.now);
}

/** Lesmateriaal: staf van de editie, alumni (kennisbank) en beheerders. */
export function canDownloadMaterial(args: {
  person: Person;
  seat: CohortSeat | null;
  now: Date;
}): boolean {
  if (args.person.isAdmin) return true;
  if (isActiveStaff(args.seat, args.now)) return true;
  return canViewLibrary(args.person);
}

// Pure toegangsregels voor de leeromgeving (geen DB, getest in access.test.ts).
// Afspraken uit het klantgesprek: cursisten zitten tijdens de opleiding in een afgeschermde
// klas, en de materiaalbibliotheek (kennisbank) is alleen voor alumni.

export interface Membership {
  cohortId: string;
  role: "cursist" | "docent" | "manager" | "alumnus" | "facilitator";
  status: "actief" | "gepauzeerd" | "afgerond" | "uitgeschreven";
  cohortStatus: "concept" | "open" | "lopend" | "afgerond";
}

export interface Person {
  isAdmin: boolean;
  memberships: Membership[];
}

/** Editie waarin iemand nog als cursist meeloopt: dat is zijn afgeschermde klas. */
export function classCohortIds(p: Person): Set<string> {
  return new Set(
    p.memberships
      .filter(
        (m) =>
          m.role === "cursist" &&
          (m.status === "actief" || m.status === "gepauzeerd") &&
          (m.cohortStatus === "open" || m.cohortStatus === "lopend"),
      )
      .map((m) => m.cohortId),
  );
}

function memberCohortIds(p: Person): Set<string> {
  return new Set(
    p.memberships
      .filter((m) => m.status !== "uitgeschreven")
      .map((m) => m.cohortId),
  );
}

function canReach(from: Person, to: Person): boolean {
  const bubble = classCohortIds(from);
  if (bubble.size === 0 || from.isAdmin || to.isAdmin) return true;
  const theirs = memberCohortIds(to);
  return [...bubble].some((id) => theirs.has(id));
}

/**
 * Alle leden kunnen elkaar berichten, behalve dat een cursist tijdens de opleiding alleen
 * contact heeft met de eigen klas (klasgenoten, docenten, facilitators). Symmetrisch: een
 * buitenstaander kan een cursist in de klas ook niet benaderen.
 */
export function canMessage(a: Person, b: Person): boolean {
  return canReach(a, b) && canReach(b, a);
}

/**
 * Alumnus: expliciet alumnus, of cursist die de opleiding heeft afgerond.
 * Toegang tot de kennisbank komt pas na afronding, niet tijdens de opleiding.
 */
export function isAlumnus(p: Person): boolean {
  return p.memberships.some(
    (m) =>
      m.status !== "uitgeschreven" &&
      (m.role === "alumnus" ||
        (m.role === "cursist" && m.status === "afgerond")),
  );
}

/** Wie mag de materiaalbibliotheek zien? Alumni en beheerders, verder niemand. */
export function canViewLibrary(p: Person): boolean {
  return p.isAdmin || isAlumnus(p);
}

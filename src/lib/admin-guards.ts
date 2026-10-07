// Pure beveiligingsregels voor beheerhandelingen op gebruikers (geen DB, getest in
// admin-guards.test.ts). Voorkomt dat beheer zichzelf buitensluit of het platform
// zonder beheerder achterlaat.

export interface UserChange {
  status?: "active" | "suspended" | "banned" | "pending_deletion" | undefined;
  role?: "user" | "admin" | undefined;
}

export interface GuardInput {
  actorId: string;
  targetId: string;
  targetRole: string;
  change: UserChange;
  /** Aantal actieve beheerders buiten het doelaccount. */
  otherActiveAdmins: number;
}

/** Foutmelding als de wijziging niet mag, anders null. */
export function checkUserChange(i: GuardInput): string | null {
  const self = i.actorId === i.targetId;
  const blocks = i.change.status !== undefined && i.change.status !== "active";
  const demotes = i.change.role === "user" && i.targetRole === "admin";

  if (self && blocks)
    return "Je kunt je eigen account niet schorsen of blokkeren.";
  if (self && demotes) return "Je kunt je eigen beheerdersrol niet intrekken.";
  if (
    i.targetRole === "admin" &&
    (blocks || demotes) &&
    i.otherActiveAdmins < 1
  )
    return "Dit is de laatste actieve beheerder; er moet er minstens één overblijven.";
  return null;
}

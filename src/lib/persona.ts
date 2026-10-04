// Welke ervaring past bij deze gebruiker? Pure afleiding uit de lidmaatschappen (geen DB,
// getest in persona.test.ts). Stuurt het menu en het startscherm; toegang blijft geregeld
// in access.ts en de routers, dit is alleen presentatie.
import { classCohortIds, isAlumnus, type Person } from "@/lib/access";

export type Persona = "docent" | "cursist" | "alumnus" | "lid";

const STAFF_ROLES = ["docent", "facilitator", "manager"];

export function derivePersona(p: Person): Persona {
  const live = p.memberships.filter((m) => m.status !== "uitgeschreven");
  const isStaff = (m: (typeof live)[number]) => STAFF_ROLES.includes(m.role);

  if (live.some((m) => isStaff(m) && m.cohortStatus !== "afgerond"))
    return "docent";
  if (classCohortIds(p).size > 0) return "cursist";
  if (isAlumnus(p)) return "alumnus";
  if (live.some(isStaff)) return "docent";
  return "lid";
}

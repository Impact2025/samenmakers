import { cache } from "react";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { derivePersona, type Persona } from "@/lib/persona";
import { loadPerson } from "./access";

/** Ervaring van de ingelogde gebruiker; per request één keer berekend. Bij twijfel: "lid". */
export const getPersona = cache(async (): Promise<Persona> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return "lid";
    const person = await loadPerson(db, session.user.id);
    return person ? derivePersona(person) : "lid";
  } catch {
    return "lid";
  }
});

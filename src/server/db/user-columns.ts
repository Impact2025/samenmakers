import { users } from "@/server/db/schema";

// Welke gebruikersvelden naar andere leden mogen. Gebruik dit bij ELKE query die een
// gebruiker teruggeeft die niet de ingelogde gebruiker zelf is (ook in `with: { author: … }`),
// zodat wachtwoord-hash, e-mail, Stripe- en CRM-gegevens de server nooit verlaten.
export const publicUserColumns = {
  id: true,
  name: true,
  naam: true,
  image: true,
  avatarUrl: true,
  bio: true,
  missie: true,
  ikZoek: true,
  sector: true,
  regio: true,
  fase: true,
  website: true,
  linkedin: true,
  expertise: true,
  zoektNaar: true,
  mentorshipRole: true,
  profileVisibility: true,
  profileCompleteness: true,
  isFeatured: true,
  isVerified: true,
  subscriptionStatus: true, // alleen voor de Pro-badge
  createdAt: true,
} as const;

/** De eigen gebruiker: alles behalve de wachtwoord-hash. */
export const selfUserColumns = { password: false } as const;

/** Dezelfde publieke velden als select-map voor `db.select(publicUserSelect).from(users)`. */
export const publicUserSelect = Object.fromEntries(
  Object.keys(publicUserColumns).map((k) => [
    k,
    users[k as keyof typeof publicUserColumns],
  ]),
) as { [K in keyof typeof publicUserColumns]: (typeof users)[K] };

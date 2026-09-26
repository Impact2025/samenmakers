import {
  Home,
  Newspaper,
  Users,
  CalendarDays,
  GraduationCap,
  MessageCircle,
  Heart,
  BookOpen,
  Handshake,
  Bookmark,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { features } from "@/lib/features";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra paden die dit item actief maken. */
  match?: string[];
}

/** Hoofdtabs — onderbalk op mobiel, bovenste groep in de sidebar. */
export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/vragen", label: "Feed", icon: Newspaper, match: ["/kennis"] },
  {
    href: "/ontdekken",
    label: "Netwerk",
    icon: Users,
    match: ["/matching", "/makers"],
  },
  {
    href: "/events",
    label: "Evenementen",
    icon: CalendarDays,
    match: ["/tickets"],
  },
  features.leren
    ? { href: "/leren", label: "Leertraject", icon: GraduationCap }
    : { href: "/berichten", label: "Berichten", icon: MessageCircle },
];

/** Overige secties — sidebar en menupaneel. */
export const secondaryNav: NavItem[] = [
  ...(features.leren
    ? [{ href: "/berichten", label: "Berichten", icon: MessageCircle }]
    : []),
  { href: "/matching", label: "Matching", icon: Heart },
  { href: "/kennis", label: "Kennisbank", icon: BookOpen },
  { href: "/mentorship", label: "Mentorship", icon: Handshake },
  { href: "/opgeslagen", label: "Opgeslagen", icon: Bookmark },
];

export const accountNav: NavItem[] = [
  { href: "/profiel", label: "Mijn profiel", icon: UserCircle },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];

export function isActive(pathname: string, item: NavItem) {
  return [item.href, ...(item.match ?? [])].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

const titles: [string, string][] = [
  ["/dashboard", "Home"],
  ["/vragen", "Feed"],
  ["/kennis", "Kennisbank"],
  ["/ontdekken", "Netwerk"],
  ["/makers", "Netwerk"],
  ["/matching", "Matching"],
  ["/events", "Evenementen"],
  ["/tickets", "Ticket"],
  ["/leren", "Leertraject"],
  ["/berichten", "Berichten"],
  ["/notificaties", "Meldingen"],
  ["/mentorship", "Mentorship"],
  ["/opgeslagen", "Opgeslagen"],
  ["/profiel", "Profiel"],
  ["/instellingen", "Instellingen"],
  ["/onboarding", "Welkom"],
];

/** Titel in het midden van de mobiele topbalk. */
export function pageTitle(pathname: string) {
  return (
    titles.find(([p]) => pathname === p || pathname.startsWith(p + "/"))?.[1] ??
    ""
  );
}

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
  Award,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { features } from "@/lib/features";
import type { Persona } from "@/lib/persona";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra paden die dit item actief maken. */
  match?: string[];
  /** Paden die dit item juist niet actief maken (eigen menu-item). */
  exclude?: string[];
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

const home: NavItem = { href: "/dashboard", label: "Home", icon: Home };
const feed: NavItem = {
  href: "/vragen",
  label: "Feed",
  icon: Newspaper,
  match: ["/kennis"],
};
const network: NavItem = {
  href: "/ontdekken",
  label: "Netwerk",
  icon: Users,
  match: ["/matching", "/makers"],
};
const events: NavItem = {
  href: "/events",
  label: "Evenementen",
  icon: CalendarDays,
  match: ["/tickets"],
};
const messages: NavItem = {
  href: "/berichten",
  label: "Berichten",
  icon: MessageCircle,
};
const matching: NavItem = { href: "/matching", label: "Matching", icon: Heart };
const knowledge: NavItem = {
  href: "/kennis",
  label: "Kennisbank",
  icon: BookOpen,
};
const mentorship: NavItem = {
  href: "/mentorship",
  label: "Mentorship",
  icon: Handshake,
};
const saved: NavItem = {
  href: "/opgeslagen",
  label: "Opgeslagen",
  icon: Bookmark,
};

export interface Nav {
  primary: NavItem[];
  secondary: NavItem[];
  account: NavItem[];
}

/**
 * Menu per ervaring. Een docent ziet zijn edities vooraan en geen matching of mentorship;
 * een alumnus de alumni-community en het lesmateriaal. Mentorship blijft zichtbaar voor wie
 * zelf mentor of mentee is. Alle routes blijven bereikbaar,
 * dit bepaalt alleen wat er in het menu staat. Zonder leeromgeving geldt het standaardmenu.
 */
export function navFor(persona: Persona, mentor = false): Nav {
  const standard: Nav = {
    primary: primaryNav,
    secondary: secondaryNav,
    account: accountNav,
  };
  if (!features.leren || persona === "lid") return standard;

  switch (persona) {
    case "docent":
      return {
        primary: [
          home,
          {
            href: "/leren",
            label: "Mijn edities",
            icon: GraduationCap,
            exclude: ["/leren/beoordelen"],
          },
          {
            href: "/leren/beoordelen",
            label: "Beoordelen",
            icon: ClipboardCheck,
          },
          messages,
          network,
        ],
        // Docenten die ook mentor zijn houden de weg naar hun mentorprofiel.
        secondary: [
          events,
          feed,
          knowledge,
          ...(mentor ? [mentorship] : []),
          saved,
        ],
        account: accountNav,
      };
    case "cursist":
      return {
        primary: [
          home,
          { href: "/leren", label: "Leertraject", icon: GraduationCap },
          messages,
          network,
          events,
        ],
        secondary: [feed, matching, knowledge, mentorship, saved],
        account: accountNav,
      };
    case "alumnus":
      return {
        primary: [
          home,
          { href: "/alumni", label: "Alumni", icon: Award },
          {
            href: "/kennis",
            label: "Kennisbank",
            icon: BookOpen,
            match: ["/kennis/materiaal"],
          },
          messages,
          network,
        ],
        secondary: [
          { href: "/leren", label: "Mijn leertraject", icon: GraduationCap },
          feed,
          events,
          matching,
          mentorship,
          saved,
        ],
        account: accountNav,
      };
  }
}

export function isActive(pathname: string, item: NavItem) {
  if (item.exclude?.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return false;
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
  ["/leren/beoordelen", "Beoordelen"],
  ["/leren", "Leertraject"],
  ["/alumni", "Alumni"],
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

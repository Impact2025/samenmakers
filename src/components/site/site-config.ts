// Basispad van de publieke site. Bij livegang van "/" wordt dit "".
export const SITE_BASE = "/wstf";

export const siteHref = (path: string) => `${SITE_BASE}${path}`;

export const PROGRAMS = [
  {
    href: "/leergang-sociaal-ondernemen",
    label: "Leergang Sociaal Ondernemen",
  },
  {
    href: "/leergang-social-intrapreneurship",
    label: "Leergang Social Intrapreneurship",
  },
  { href: "/reshaping-your-future", label: "Reshaping Your Future" },
] as const;

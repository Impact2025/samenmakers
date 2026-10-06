import { api } from "@/trpc/server";
import { DEFAULT_EVENT_TZ, eventDateParts } from "@/lib/event-format";
import { siteHref } from "./site-config";
import {
  UpcomingEventsSlider,
  type SliderEvent,
} from "./upcoming-events-slider";

/** Platte tekst uit een markdown-beschrijving, voor op een kaart. */
function plain(md: string | null, max = 200) {
  if (!md) return "";
  const t = md
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

/** "Aankomende evenementen" met de live events uit de app. */
export async function UpcomingEvents() {
  const events: SliderEvent[] = await api.events
    .list({ upcoming: true, limit: 6 })
    .then((r) =>
      r.items.map((e) => {
        const { day, month } = eventDateParts(
          e.startAt,
          e.timezone || DEFAULT_EVENT_TZ,
        );
        return {
          id: e.id,
          href: siteHref(`/events/${e.slug}`),
          image: e.coverImageUrl,
          date: `${day} ${month}`,
          title: e.title,
          description: plain(e.description),
        };
      }),
    )
    .catch(() => []);

  if (events.length === 0) return null;
  return <UpcomingEventsSlider events={events} />;
}

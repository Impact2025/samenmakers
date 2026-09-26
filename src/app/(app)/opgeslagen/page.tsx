import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Opgeslagen makers" };

export default async function OpgeslagenPage() {
  const bookmarks = await api.connections.myBookmarks();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-label-md text-secondary mb-1">Netwerk</p>
        <h1 className="text-headline-lg text-on-surface">Opgeslagen makers</h1>
        <p className="text-body-md text-secondary mt-1">
          {bookmarks.length} opgeslagen
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="border-hairline border py-20 text-center">
          <p className="text-on-surface-variant mb-2">Nog niets opgeslagen</p>
          <p className="text-body-md text-secondary mb-6">
            Sla makers op via hun profielpagina om ze hier terug te vinden.
          </p>
          <Link
            href="/ontdekken"
            className="bg-primary text-on-primary text-label-md hover:bg-primary/90 shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-colors"
          >
            Makers ontdekken
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => {
            if (!b.user) return null;
            const naam = b.user.naam ?? b.user.name ?? "Maker";
            return (
              <Link
                key={b.id}
                href={`/makers/${b.user.id}`}
                className="hover:shadow-elevated bg-surface-container-lowest shadow-card flex items-center gap-4 rounded-2xl p-4 transition-colors"
              >
                <Avatar
                  src={b.user.avatarUrl}
                  naam={naam}
                  size="md"
                  grayscale={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface font-bold">{naam}</p>
                  {b.user.sector && (
                    <p className="text-body-md text-secondary">
                      {b.user.sector}
                    </p>
                  )}
                  {b.user.missie && (
                    <p className="text-body-md text-on-surface-variant mt-0.5 line-clamp-1">
                      {b.user.missie}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {b.user.regio && (
                    <Badge variant="default" size="sm">
                      {b.user.regio}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

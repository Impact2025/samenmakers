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
        <p className="text-label-caps text-outline mb-1">NETWERK</p>
        <h1 className="text-headline-md text-on-surface">Opgeslagen makers</h1>
        <p className="text-body-sm text-outline mt-1">{bookmarks.length} opgeslagen</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 border border-hairline">
          <p className="text-on-surface-variant mb-2">Nog niets opgeslagen</p>
          <p className="text-body-sm text-outline mb-6">
            Sla makers op via hun profielpagina om ze hier terug te vinden.
          </p>
          <Link
            href="/ontdekken"
            className="px-6 py-3 bg-primary text-on-primary font-bold text-label-caps hover:bg-primary/90 transition-colors"
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
                className="flex items-center gap-4 p-4 border border-hairline hover:border-on-surface transition-colors bg-white"
              >
                <Avatar src={b.user.avatarUrl} naam={naam} size="md" grayscale={false} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface">{naam}</p>
                  {b.user.sector && (
                    <p className="text-body-sm text-outline">{b.user.sector}</p>
                  )}
                  {b.user.missie && (
                    <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                      {b.user.missie}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 justify-end shrink-0">
                  {b.user.regio && (
                    <Badge variant="default" size="sm">{b.user.regio}</Badge>
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

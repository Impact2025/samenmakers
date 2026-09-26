import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Opgeslagen makers" };

export default async function OpgeslagenPage() {
  const bookmarks = await api.connections.myBookmarks();

  return (
    <div>
      <PageHeader
        title="Opgeslagen makers"
        description={`${bookmarks.length} opgeslagen`}
        className="mb-5"
      />

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={22} />}
          title="Nog niets opgeslagen"
          description="Sla makers op via hun profielpagina om ze hier terug te vinden."
          action={
            <Link href="/ontdekken" className={buttonClasses("primary", "md")}>
              Makers ontdekken
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarks.map((b) => {
            if (!b.user) return null;
            const naam = b.user.naam ?? b.user.name ?? "Maker";
            return (
              <Link
                key={b.id}
                href={`/makers/${b.user.id}`}
                className="bg-surface-container-lowest shadow-card hover:shadow-elevated flex items-center gap-3 rounded-2xl p-4 transition-shadow"
              >
                <Avatar src={b.user.avatarUrl} naam={naam} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-title-md text-on-surface truncate">
                    {naam}
                  </p>
                  {b.user.sector && (
                    <p className="text-body-sm text-primary-container font-medium">
                      {b.user.sector}
                    </p>
                  )}
                  {b.user.missie && (
                    <p className="text-body-sm text-secondary line-clamp-1">
                      {b.user.missie}
                    </p>
                  )}
                </div>
                {b.user.regio && (
                  <span className="bg-surface-container text-label-sm text-secondary flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1">
                    <MapPin size={12} /> {b.user.regio}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

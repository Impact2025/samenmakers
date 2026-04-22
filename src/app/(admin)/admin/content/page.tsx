import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentModerationActions } from "./content-moderation-actions";

export const metadata: Metadata = { title: "Admin — Content" };

export default async function AdminContentPage() {
  const { unpublishedPosts, unpublishedEvents, pendingReports } =
    await api.admin.pendingContent();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-on-surface">Content moderatie</h1>

      {/* Posts awaiting approval */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-label-caps text-on-surface">TE PUBLICEREN POSTS</h2>
            <Badge variant="default">{unpublishedPosts.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {unpublishedPosts.length === 0 ? (
            <p className="text-sm text-outline px-6 py-8">Geen posts in de wachtrij</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {unpublishedPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{post.title}</p>
                    <p className="text-xs text-outline mt-0.5">
                      door {post.author.naam ?? post.author.name} · {post.category}
                    </p>
                  </div>
                  <ContentModerationActions type="post" id={post.id} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Events awaiting approval */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-label-caps text-on-surface">TE PUBLICEREN EVENTS</h2>
            <Badge variant="default">{unpublishedEvents.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {unpublishedEvents.length === 0 ? (
            <p className="text-sm text-outline px-6 py-8">Geen events in de wachtrij</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {unpublishedEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{event.title}</p>
                    <p className="text-xs text-outline mt-0.5">
                      door {event.organiser.naam ?? event.organiser.name}
                    </p>
                  </div>
                  <ContentModerationActions type="event" id={event.id} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Reports */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-label-caps text-on-surface">MELDINGEN</h2>
            <Badge variant={pendingReports.length > 0 ? "primary" : "default"}>
              {pendingReports.length}
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {pendingReports.length === 0 ? (
            <p className="text-sm text-outline px-6 py-8">Geen openstaande meldingen</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {pendingReports.map((report) => (
                <li key={report.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <Badge variant="default" size="sm" className="mb-1">{report.type}</Badge>
                    <p className="text-xs text-outline">{report.description ?? "Geen omschrijving"}</p>
                  </div>
                  <ContentModerationActions type="report" id={report.id} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

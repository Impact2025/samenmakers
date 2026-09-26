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
      <h1 className="text-headline-lg text-on-surface">Content moderatie</h1>

      {/* Posts awaiting approval */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">
              Te publiceren posts
            </h2>
            <Badge variant="default">{unpublishedPosts.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {unpublishedPosts.length === 0 ? (
            <p className="text-secondary px-6 py-8 text-sm">
              Geen posts in de wachtrij
            </p>
          ) : (
            <ul className="divide-hairline divide-y">
              {unpublishedPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-on-surface truncate text-sm font-semibold">
                      {post.title}
                    </p>
                    <p className="text-secondary mt-0.5 text-xs">
                      door {post.author.naam ?? post.author.name} ·{" "}
                      {post.category}
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
            <h2 className="text-headline-sm text-on-surface">
              Te publiceren events
            </h2>
            <Badge variant="default">{unpublishedEvents.length}</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {unpublishedEvents.length === 0 ? (
            <p className="text-secondary px-6 py-8 text-sm">
              Geen events in de wachtrij
            </p>
          ) : (
            <ul className="divide-hairline divide-y">
              {unpublishedEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-on-surface truncate text-sm font-semibold">
                      {event.title}
                    </p>
                    <p className="text-secondary mt-0.5 text-xs">
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
            <h2 className="text-headline-sm text-on-surface">Meldingen</h2>
            <Badge variant={pendingReports.length > 0 ? "primary" : "default"}>
              {pendingReports.length}
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {pendingReports.length === 0 ? (
            <p className="text-secondary px-6 py-8 text-sm">
              Geen openstaande meldingen
            </p>
          ) : (
            <ul className="divide-hairline divide-y">
              {pendingReports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <Badge variant="default" size="sm" className="mb-1">
                      {report.type}
                    </Badge>
                    <p className="text-secondary text-xs">
                      {report.description ?? "Geen omschrijving"}
                    </p>
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

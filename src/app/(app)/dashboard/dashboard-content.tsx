"use client";

import Link from "next/link";
import {
  ArrowRight,
  Users,
  MessageSquare,
  Zap,
  Calendar,
  Bell,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/date-utils";
import { eventWhere } from "@/lib/event-format";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Me = RouterOutputs["users"]["me"];
type Matches = RouterOutputs["matches"]["myMatches"];
type Notifications = RouterOutputs["notifications"]["list"];
type EventItems = RouterOutputs["events"]["list"]["items"];

interface Props {
  me: Me;
  matches: Matches;
  notifications: Notifications;
  events: EventItems;
}

export function DashboardContent({
  me,
  matches,
  notifications,
  events,
}: Props) {
  const firstName = me?.naam?.split(" ")[0] ?? "Maker";
  const completeness = me?.profileCompleteness ?? 0;
  const unreadNotifications = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-caps text-outline mb-1">WELKOM TERUG</p>
          <h1 className="text-headline-md text-on-surface">
            Goedemorgen, {firstName}
          </h1>
        </div>
        <Link href="/notificaties" className="relative">
          <Bell size={22} className="text-outline" />
          {unreadNotifications > 0 && (
            <span className="bg-primary text-on-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      {/* Profile completeness — only show if < 100% */}
      {completeness < 100 && (
        <Card className="border-primary/20 bg-surface-container-low">
          <CardBody className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-label-caps text-outline">
                  PROFIEL COMPLEETHEID
                </p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Maak je profiel compleet voor meer matches
                </p>
              </div>
              <span className="text-headline-sm text-primary font-black">
                {completeness}%
              </span>
            </div>
            <div className="bg-hairline h-1.5 w-full">
              <div
                className="bg-primary h-1.5 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="mt-4">
              <Link href="/profiel/bewerken">
                <Button variant="secondary" className="px-4 py-2 text-sm">
                  Profiel aanvullen
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users size={18} />}
          label="Matches"
          value={matches.length}
          href="/matching"
        />
        <StatCard
          icon={<MessageSquare size={18} />}
          label="Gesprekken"
          value={matches.filter((m) => m.messages.length > 0).length}
          href="/berichten"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Events"
          value={events.length}
          href="/events"
        />
        <StatCard
          icon={<Zap size={18} />}
          label="Pro status"
          value={me?.subscriptionStatus === "active" ? "Actief" : "Basis"}
          href="/instellingen/abonnement"
          isText
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent matches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-label-caps text-on-surface">
                  MIJN MATCHES
                </h2>
                <Link
                  href="/matching"
                  className="text-label-caps text-primary flex items-center gap-1"
                >
                  ALLE <ArrowRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {matches.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-body-sm text-outline mb-4">
                    Nog geen matches. Ga ontdekken!
                  </p>
                  <Link href="/ontdekken">
                    <Button variant="primary">Ontdek makers</Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-hairline divide-y">
                  {matches.slice(0, 5).map((match) => {
                    const other =
                      match.userId === me?.id ? match.target : match.user;
                    const lastMsg = match.messages[0];
                    return (
                      <li key={match.id}>
                        <Link
                          href={`/berichten/${match.id}`}
                          className="hover:bg-surface-container-low flex items-center gap-4 px-6 py-4 transition-colors"
                        >
                          <Avatar
                            src={other.avatarUrl}
                            naam={other.naam ?? other.name ?? "?"}
                            size="md"
                            grayscale={false}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-on-surface truncate text-sm font-semibold">
                              {other.naam ?? other.name}
                            </p>
                            <p className="text-outline mt-0.5 truncate text-xs">
                              {lastMsg?.content ?? "Stuur een bericht"}
                            </p>
                          </div>
                          {lastMsg && (
                            <span className="text-outline shrink-0 text-[10px]">
                              {formatRelative(new Date(lastMsg.createdAt))}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column: events + notifications */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-label-caps text-on-surface">
                  KOMENDE EVENTS
                </h2>
                <Link
                  href="/events"
                  className="text-label-caps text-primary flex items-center gap-1"
                >
                  ALLE <ArrowRight size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {events.length === 0 ? (
                <p className="text-body-sm text-outline px-6 py-8 text-center">
                  Geen events gepland
                </p>
              ) : (
                <ul className="divide-hairline divide-y">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:bg-surface-container-low flex gap-3 px-5 py-4 transition-colors"
                      >
                        <div className="w-10 shrink-0 text-center">
                          <span className="text-outline block text-[10px] font-bold uppercase">
                            {new Date(event.startAt).toLocaleDateString(
                              "nl-NL",
                              { month: "short" },
                            )}
                          </span>
                          <span className="text-on-surface text-lg leading-none font-black">
                            {new Date(event.startAt).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-on-surface truncate text-sm font-semibold">
                            {event.title}
                          </p>
                          <p className="text-outline mt-0.5 text-xs">
                            {eventWhere(event)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Recent notifications */}
          <Card>
            <CardHeader>
              <h2 className="text-label-caps text-on-surface">MELDINGEN</h2>
            </CardHeader>
            <CardBody className="p-0">
              {notifications.length === 0 ? (
                <p className="text-body-sm text-outline px-6 py-8 text-center">
                  Geen meldingen
                </p>
              ) : (
                <ul className="divide-hairline divide-y">
                  {notifications.slice(0, 4).map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.url ?? "/dashboard"}
                        className="hover:bg-surface-container-low flex gap-3 px-5 py-4 transition-colors"
                      >
                        <div
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            n.readAt ? "bg-transparent" : "bg-primary"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-on-surface text-sm font-medium">
                            {n.title}
                          </p>
                          <p className="text-outline mt-0.5 line-clamp-2 text-xs">
                            {n.body}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href: string;
  isText?: boolean;
}

function StatCard({ icon, label, value, href, isText = false }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="group hover:border-primary p-5 transition-colors">
        <div className="text-outline group-hover:text-primary mb-3 flex items-center gap-2 transition-colors">
          {icon}
          <span className="text-label-caps">{label}</span>
        </div>
        <p
          className={`text-on-surface font-black ${isText ? "text-xl" : "text-3xl"}`}
        >
          {value}
        </p>
      </Card>
    </Link>
  );
}

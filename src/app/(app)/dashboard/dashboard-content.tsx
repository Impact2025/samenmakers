"use client";

import Link from "next/link";
import { ArrowRight, Users, MessageSquare, Zap, Calendar, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelative, formatDate } from "@/lib/date-utils";
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

export function DashboardContent({ me, matches, notifications, events }: Props) {
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
        <Link href="/instellingen/notifications" className="relative">
          <Bell size={22} className="text-outline" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      {/* Profile completeness — only show if < 100% */}
      {completeness < 100 && (
        <Card className="border-primary/20 bg-surface-container-low">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-label-caps text-outline">PROFIEL COMPLEETHEID</p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Maak je profiel compleet voor meer matches
                </p>
              </div>
              <span className="text-headline-sm text-primary font-black">{completeness}%</span>
            </div>
            <div className="w-full bg-hairline h-1.5">
              <div
                className="h-1.5 bg-primary transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="mt-4">
              <Link href="/profiel/bewerken">
                <Button variant="secondary" className="text-sm py-2 px-4">
                  Profiel aanvullen
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent matches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-label-caps text-on-surface">MIJN MATCHES</h2>
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
                <div className="py-12 text-center px-6">
                  <p className="text-body-sm text-outline mb-4">
                    Nog geen matches. Ga ontdekken!
                  </p>
                  <Link href="/ontdekken">
                    <Button variant="primary">Ontdek makers</Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-hairline">
                  {matches.slice(0, 5).map((match) => {
                    const other = match.userId === me?.id ? match.target : match.user;
                    const lastMsg = match.messages[0];
                    return (
                      <li key={match.id}>
                        <Link
                          href={`/berichten/${match.id}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors"
                        >
                          <Avatar
                            src={other.avatarUrl}
                            naam={other.naam ?? other.name ?? "?"}
                            size="md"
                            grayscale={false}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">
                              {other.naam ?? other.name}
                            </p>
                            <p className="text-outline text-xs truncate mt-0.5">
                              {lastMsg?.content ?? "Stuur een bericht"}
                            </p>
                          </div>
                          {lastMsg && (
                            <span className="text-[10px] text-outline shrink-0">
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
                <h2 className="text-label-caps text-on-surface">KOMENDE EVENTS</h2>
                <Link href="/events" className="text-label-caps text-primary flex items-center gap-1">
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
                <ul className="divide-y divide-hairline">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors"
                      >
                        <div className="shrink-0 w-10 text-center">
                          <span className="text-[10px] font-bold text-outline uppercase block">
                            {new Date(event.startAt).toLocaleDateString("nl-NL", { month: "short" })}
                          </span>
                          <span className="text-lg font-black text-on-surface leading-none">
                            {new Date(event.startAt).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">{event.title}</p>
                          <p className="text-xs text-outline mt-0.5">
                            {event.isOnline ? "Online" : event.location ?? "Locatie TBD"}
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
                <ul className="divide-y divide-hairline">
                  {notifications.slice(0, 4).map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.url ?? "/dashboard"}
                        className="flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            n.readAt ? "bg-transparent" : "bg-primary"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface">{n.title}</p>
                          <p className="text-xs text-outline mt-0.5 line-clamp-2">{n.body}</p>
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
      <Card className="p-5 group hover:border-primary transition-colors">
        <div className="flex items-center gap-2 text-outline mb-3 group-hover:text-primary transition-colors">
          {icon}
          <span className="text-label-caps">{label}</span>
        </div>
        <p className={`font-black text-on-surface ${isText ? "text-xl" : "text-3xl"}`}>
          {value}
        </p>
      </Card>
    </Link>
  );
}

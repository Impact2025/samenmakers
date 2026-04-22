import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth/config";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Calendar, MapPin, Monitor, Users, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";
import { EventRsvpButton } from "./event-rsvp-button";
import { EventCheckinPanel } from "./event-checkin-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await api.events.byId({ id });
  if (!event) return { title: "Niet gevonden" };
  return { title: event.title, description: event.description ?? undefined };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const [event, session] = await Promise.all([
    api.events.byId({ id }),
    auth(),
  ]);
  if (!event) notFound();

  const isOrganiser =
    session?.user?.id === event.organiserId || session?.user?.role === "admin";
  const registeredCount = event.attendees.filter((a) => a.status === "registered").length;
  const waitlistCount = event.attendees.filter((a) => a.status === "waitlisted").length;
  const isFull = event.maxAttendees !== null && registeredCount >= event.maxAttendees;

  return (
    <div className="max-w-2xl space-y-6">
      {event.coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden border border-hairline">
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="text-headline-md text-on-surface mb-3">{event.title}</h1>
        <div className="flex flex-wrap gap-2">
          {event.isOnline ? (
            <Badge variant="default"><Monitor size={11} className="inline mr-1" />Online</Badge>
          ) : (
            <Badge variant="default">
              <MapPin size={11} className="inline mr-1" />
              {event.location ?? "Locatie TBD"}
            </Badge>
          )}
          <Badge variant="default">
            <Calendar size={11} className="inline mr-1" />
            {formatDateTime(event.startAt)}
          </Badge>
          {event.maxAttendees && (
            <Badge variant={isFull ? "primary" : "default"}>
              <Users size={11} className="inline mr-1" />
              {registeredCount} / {event.maxAttendees}
              {isFull && " — Wachtlijst"}
            </Badge>
          )}
        </div>
      </div>

      {/* RSVP */}
      <EventRsvpButton eventId={event.id} />

      {/* Description */}
      {event.description && (
        <Card>
          <CardBody>
            <p className="text-body text-on-surface-variant whitespace-pre-line">{event.description}</p>
          </CardBody>
        </Card>
      )}

      {/* Meeting URL for online events */}
      {event.isOnline && event.meetingUrl && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-label-caps text-outline mb-1">LINK</p>
              <p className="text-body-sm text-on-surface">Deelname link</p>
            </div>
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-label-caps text-primary"
            >
              <ExternalLink size={14} />
              Deelnemen
            </a>
          </CardBody>
        </Card>
      )}

      {/* Organiser */}
      <Card>
        <CardBody>
          <p className="text-label-caps text-outline mb-3">ORGANISATOR</p>
          <div className="flex items-center gap-3">
            <Avatar
              src={event.organiser.avatarUrl}
              naam={event.organiser.naam ?? event.organiser.name ?? "?"}
              size="md"
              grayscale={false}
            />
            <p className="font-semibold text-on-surface">
              {event.organiser.naam ?? event.organiser.name}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Attendees */}
      {event.attendees.length > 0 && (
        <Card>
          <CardBody>
            <p className="text-label-caps text-outline mb-3">
              DEELNEMERS ({registeredCount})
              {waitlistCount > 0 && ` + ${waitlistCount} op wachtlijst`}
            </p>
            <div className="flex flex-wrap gap-2">
              {event.attendees
                .filter((a) => a.status === "registered")
                .slice(0, 12)
                .map((a) => (
                  <Avatar
                    key={a.id}
                    src={a.user.avatarUrl}
                    naam={a.user.naam ?? a.user.name ?? "?"}
                    size="sm"
                    grayscale={false}
                  />
                ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Organiser check-in panel */}
      {isOrganiser && event.attendees.length > 0 && (
        <EventCheckinPanel eventId={event.id} attendees={event.attendees} />
      )}
    </div>
  );
}

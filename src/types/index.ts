export type { Session, User } from "next-auth";

export interface UserProfile {
  id: string;
  naam: string;
  bio: string | null;
  missie: string | null;
  ikZoek: string | null;
  sector: string | null;
  regio: string | null;
  fase: "starter" | "groei" | "scale" | null;
  avatarUrl: string | null;
  website: string | null;
  linkedin: string | null;
  expertise: string[];
  mentorshipRole: "mentor" | "mentee" | "both" | "none";
  isFeatured: boolean;
  isVerified: boolean;
  profileVisibility: "public" | "members";
  subscriptionStatus: "none" | "active" | "past_due" | "canceled";
  createdAt: Date;
}

export interface MatchWithProfiles {
  id: string;
  status: "pending" | "matched" | "declined";
  user: UserProfile;
  target: UserProfile;
  createdAt: Date;
}

export interface MessageWithSender {
  id: string;
  matchId: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
  sender: Pick<UserProfile, "id" | "naam" | "avatarUrl">;
}

export interface EventWithOrganiser {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  isOnline: boolean;
  meetingUrl: string | null;
  coverImageUrl: string | null;
  startAt: Date;
  endAt: Date | null;
  maxAttendees: number | null;
  attendeeCount: number;
  isAttending: boolean;
  organiser: Pick<UserProfile, "id" | "naam" | "avatarUrl">;
}

export interface PostWithAuthor {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: "blog" | "kennisbank" | "tool" | "funding";
  publishedAt: Date | null;
  author: Pick<UserProfile, "id" | "naam" | "avatarUrl">;
}

export interface NotificationPayload {
  type:
    | "new_match"
    | "connection_request"
    | "new_message"
    | "event_reminder"
    | "event_post_suggestion"
    | "profile_view"
    | "milestone";
  title: string;
  body: string;
  url?: string;
  avatarUrl?: string;
}

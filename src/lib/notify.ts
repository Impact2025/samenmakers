import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { notifications } from "@/server/db/schema";
import { sendPushToUser } from "@/lib/push";

type DB = PostgresJsDatabase<typeof schema>;

type NotificationType =
  | "new_match"
  | "connection_request"
  | "new_message"
  | "event_reminder"
  | "event_post_suggestion"
  | "profile_view"
  | "milestone"
  | "referral_reward"
  | "system";

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  url?: string;
  avatarUrl?: string;
}

export async function createNotification(db: DB, input: NotificationInput): Promise<void> {
  const { userId, type, title, body, url, avatarUrl } = input;

  await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      body,
      ...(url ? { url } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    })
    .onConflictDoNothing();

  void sendPushToUser(userId, { title, body, ...(url ? { url } : {}) }).catch(
    () => undefined,
  );
}

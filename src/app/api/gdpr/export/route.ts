import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users, matches, messages, notifications, bookmarks } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, myMatches, myMessages, myNotifications, myBookmarks] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.matches.findMany({
      where: or(eq(matches.userId, userId), eq(matches.targetId, userId)),
    }),
    db.select().from(messages).where(eq(messages.senderId, userId)),
    db.query.notifications.findMany({ where: eq(notifications.userId, userId) }),
    db.query.bookmarks.findMany({ where: eq(bookmarks.userId, userId) }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      ...user,
      password: "[VERWIJDERD]",
    },
    matches: myMatches,
    messages: myMessages,
    notifications: myNotifications,
    bookmarks: myBookmarks,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="samenmakers-export-${userId}.json"`,
    },
  });
}

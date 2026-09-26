import { auth } from "@/server/auth/config";
import { NextResponse } from "next/server";
import Pusher from "pusher";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/server/db";
import { matches } from "@/server/db/schema";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
  useTLS: true,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id") ?? "";
  const channelName = params.get("channel_name") ?? "";

  // Private channels must be prefixed with `private-`; user channels with `private-user-{id}`
  if (!channelName.startsWith("private-")) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 403 });
  }

  // Alleen je eigen user-kanaal, of het kanaal van een match waar je zelf deel van uitmaakt.
  const userChannel = `private-user-${session.user.id}`;
  const matchPrefix = "private-match-";
  if (channelName !== userChannel) {
    if (!channelName.startsWith(matchPrefix)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const matchId = channelName.slice(matchPrefix.length);
    const match = await db.query.matches.findFirst({
      where: and(
        eq(matches.id, matchId),
        eq(matches.status, "matched"),
        or(
          eq(matches.userId, session.user.id),
          eq(matches.targetId, session.user.id),
        ),
      ),
      columns: { id: true },
    });
    if (!match) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
  });

  return NextResponse.json(authResponse);
}

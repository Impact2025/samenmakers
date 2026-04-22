import { auth } from "@/server/auth/config";
import { NextResponse } from "next/server";
import Pusher from "pusher";

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

  // For user-specific channels, verify ownership
  const userChannel = `private-user-${session.user.id}`;
  const matchChannel = `private-match-`;
  if (
    channelName !== userChannel &&
    !channelName.startsWith(matchChannel)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
  });

  return NextResponse.json(authResponse);
}

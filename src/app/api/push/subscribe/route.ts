import { auth } from "@/server/auth/config";
import { NextResponse } from "next/server";
import { z } from "zod";
import { storePushSubscription, removePushSubscription } from "@/lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    auth: z.string(),
    p256dh: z.string(),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await storePushSubscription(session.user.id, parsed.data);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await removePushSubscription(session.user.id);
  return NextResponse.json({ success: true });
}

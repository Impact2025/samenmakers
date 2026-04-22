import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/inloggen", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  // Mark account for deletion (30-day grace period)
  await db
    .update(users)
    .set({ status: "pending_deletion", updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.redirect(
    new URL("/instellingen?deleted=1", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  );
}

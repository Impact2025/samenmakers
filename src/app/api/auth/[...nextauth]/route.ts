import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { handlers } = await import("@/server/auth/config");
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const { handlers } = await import("@/server/auth/config");
  return handlers.POST(req);
}

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/init";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function logError({ path, error }: { path: string | undefined; error: unknown }) {
  console.error(`tRPC error on ${path ?? "<no-path>"}:`, error);
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    ...(process.env.NODE_ENV === "development" && { onError: logError }),
  });

export { handler as GET, handler as POST };

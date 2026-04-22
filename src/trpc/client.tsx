"use client";

import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/server/trpc/root";
import { transformer } from "./shared";

export const trpc = createTRPCReact<AppRouter>();

export function makeClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchStreamLink({
        transformer,
        url: "/api/trpc",
        headers() {
          const h = new Headers();
          h.set("x-trpc-source", "client");
          return h;
        },
      }),
    ],
  });
}

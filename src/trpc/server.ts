import "server-only";
import { createTRPCContext, createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/root";
import { cache } from "react";
import { headers } from "next/headers";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({
    req: new Request("http://internal/trpc", { headers: heads }),
  });
});

const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);

"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, makeClient } from "@/trpc/client";
import { makeQueryClient } from "@/trpc/query-client";
import type { QueryClient } from "@tanstack/react-query";

let clientQueryClientSingleton: QueryClient;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  return (clientQueryClientSingleton ??= makeQueryClient());
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => makeClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

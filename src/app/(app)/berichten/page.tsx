import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { ConversationList } from "./conversation-list";

export const metadata: Metadata = { title: "Berichten" };

export default async function BerichtenPage() {
  const matches = await api.matches.myMatches();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-label-md text-secondary mb-1">Communicatie</p>
        <h1 className="text-headline-lg text-on-surface">Berichten</h1>
      </div>
      <ConversationList initialMatches={matches} />
    </div>
  );
}

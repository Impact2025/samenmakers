import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { ConversationList } from "./conversation-list";

export const metadata: Metadata = { title: "Berichten" };

export default async function BerichtenPage() {
  const matches = await api.matches.myMatches();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-label-caps text-outline mb-1">COMMUNICATIE</p>
        <h1 className="text-headline-md text-on-surface">Berichten</h1>
      </div>
      <ConversationList initialMatches={matches} />
    </div>
  );
}

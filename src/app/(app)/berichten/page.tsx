import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { ConversationList } from "./conversation-list";

export const metadata: Metadata = { title: "Berichten" };

export default async function BerichtenPage() {
  const matches = await api.matches.myMatches();

  return (
    <div>
      <PageHeader
        title="Berichten"
        description="Gesprekken met je matches"
        className="mb-5"
      />
      <ConversationList initialMatches={matches} />
    </div>
  );
}

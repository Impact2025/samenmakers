import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth/config";
import { ChatWindow } from "./chat-window";

interface Props {
  params: Promise<{ matchId: string }>;
}

export const metadata: Metadata = { title: "Gesprek" };

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const [history, matches] = await Promise.all([
    api.messages.history({ matchId, limit: 30 }),
    api.matches.myMatches(),
  ]);

  const match = matches.find((m) => m.id === matchId);
  if (!match) notFound();

  const other =
    match.userId === session.user.id ? match.target : match.user;

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col max-w-2xl">
      <ChatWindow
        matchId={matchId}
        myId={session.user.id}
        other={{ id: other.id, naam: other.naam ?? other.name ?? "Maker", avatarUrl: other.avatarUrl }}
        initialMessages={history.items}
      />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { ZOEKT_NAAR_OPTIONS } from "@/lib/constants";
import PusherClient from "pusher-js";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { formatRelative } from "@/lib/date-utils";
import type { AppRouter } from "@/server/trpc/root";
import type { inferRouterOutputs } from "@trpc/server";

type Messages = inferRouterOutputs<AppRouter>["messages"]["history"]["items"];

interface Props {
  matchId: string;
  myId: string;
  other: {
    id: string;
    naam: string;
    avatarUrl: string | null | undefined;
    missie?: string | null;
    ikZoek?: string | null;
    zoektNaar?: string[];
  };
  initialMessages: Messages;
}

let pusherInstance: PusherClient | null = null;
function getPusher() {
  if (!pusherInstance && process.env.NEXT_PUBLIC_PUSHER_KEY) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherInstance;
}

export function ChatWindow({ matchId, myId, other, initialMessages }: Props) {
  const [content, setContent] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasContext = !!(other.missie ?? other.ikZoek ?? (other.zoektNaar && other.zoektNaar.length > 0));
  const utils = trpc.useUtils();

  const { data } = trpc.messages.history.useQuery(
    { matchId, limit: 30 },
    { initialData: { items: initialMessages, nextCursor: undefined } },
  );

  const send = trpc.messages.send.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.messages.history.invalidate({ matchId });
    },
  });

  const markRead = trpc.messages.markRead.useMutation();

  // Pusher subscription for real-time messages
  useEffect(() => {
    const pusher = getPusher();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-match-${matchId}`);
    channel.bind("new-message", () => {
      void utils.messages.history.invalidate({ matchId });
    });

    return () => {
      channel.unbind("new-message");
      pusher.unsubscribe(`private-match-${matchId}`);
    };
  }, [matchId, utils]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.items.length]);

  useEffect(() => {
    void markRead.mutate({ matchId });
  }, [matchId]);

  const messages = data?.items ?? initialMessages;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    send.mutate({ matchId, content: content.trim() });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 py-4 hairline-b shrink-0">
        <Link href="/berichten" className="p-2 -ml-2 text-outline hover:text-on-surface lg:hidden">
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/makers/${other.id}`} className="flex items-center gap-3 group flex-1 min-w-0">
          <Avatar src={other.avatarUrl} naam={other.naam} size="sm" grayscale={false} />
          <span className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
            {other.naam}
          </span>
        </Link>
        {hasContext && (
          <button
            onClick={() => setContextOpen((v) => !v)}
            className="p-2 -mr-2 text-outline hover:text-on-surface transition-colors shrink-0"
            aria-label={contextOpen ? "Context verbergen" : "Context tonen"}
          >
            {contextOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {/* Context panel */}
      {hasContext && contextOpen && (
        <div className="bg-surface-container-low hairline-b px-4 py-3 text-xs space-y-2 shrink-0">
          <p className="text-label-caps text-outline mb-1">{other.naam.toUpperCase()}</p>
          {other.missie && (
            <p className="text-on-surface-variant">
              <span className="font-semibold text-on-surface">Missie: </span>{other.missie}
            </p>
          )}
          {other.zoektNaar && other.zoektNaar.length > 0 && (
            <p className="text-on-surface-variant">
              <span className="font-semibold text-on-surface">Op zoek naar: </span>
              {other.zoektNaar
                .map((z) => ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ?? z)
                .join(", ")}
            </p>
          )}
          {other.ikZoek && !other.zoektNaar?.length && (
            <p className="text-on-surface-variant">
              <span className="font-semibold text-on-surface">Zoekt: </span>{other.ikZoek}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-body-sm text-outline">
            Stuur een eerste bericht om het gesprek te starten.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === myId;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isMe && (
                <Avatar src={other.avatarUrl} naam={other.naam} size="xs" grayscale={false} />
              )}
              <div
                className={`max-w-[80vw] lg:max-w-md group flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-3 text-sm ${
                    isMe
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface border border-hairline"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-outline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatRelative(new Date(msg.createdAt))}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 hairline-t pt-4 pb-safe shrink-0">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Typ een bericht…"
          className="flex-1 border border-hairline bg-white px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface"
          disabled={send.isPending}
        />
        <button
          type="submit"
          disabled={!content.trim() || send.isPending}
          className="px-5 bg-primary text-on-primary disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {send.isPending ? <Spinner /> : <Send size={16} />}
        </button>
      </form>
    </>
  );
}

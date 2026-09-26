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
  const hasContext = !!(
    other.missie ??
    other.ikZoek ??
    (other.zoektNaar && other.zoektNaar.length > 0)
  );
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
      <div className="hairline-b flex shrink-0 items-center gap-4 py-4">
        <Link
          href="/berichten"
          className="text-secondary hover:text-on-surface -ml-2 p-2 lg:hidden"
        >
          <ArrowLeft size={20} />
        </Link>
        <Link
          href={`/makers/${other.id}`}
          className="group flex min-w-0 flex-1 items-center gap-3"
        >
          <Avatar
            src={other.avatarUrl}
            naam={other.naam}
            size="sm"
            grayscale={false}
          />
          <span className="text-on-surface group-hover:text-primary truncate font-semibold transition-colors">
            {other.naam}
          </span>
        </Link>
        {hasContext && (
          <button
            onClick={() => setContextOpen((v) => !v)}
            className="text-secondary hover:text-on-surface -mr-2 shrink-0 p-2 transition-colors"
            aria-label={contextOpen ? "Context verbergen" : "Context tonen"}
          >
            {contextOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {/* Context panel */}
      {hasContext && contextOpen && (
        <div className="bg-surface-container-low hairline-b shrink-0 space-y-2 px-4 py-3 text-xs">
          <p className="text-label-md text-secondary mb-1">
            {other.naam.toUpperCase()}
          </p>
          {other.missie && (
            <p className="text-on-surface-variant">
              <span className="text-on-surface font-semibold">Missie: </span>
              {other.missie}
            </p>
          )}
          {other.zoektNaar && other.zoektNaar.length > 0 && (
            <p className="text-on-surface-variant">
              <span className="text-on-surface font-semibold">
                Op zoek naar:{" "}
              </span>
              {other.zoektNaar
                .map(
                  (z) =>
                    ZOEKT_NAAR_OPTIONS.find((o) => o.value === z)?.label ?? z,
                )
                .join(", ")}
            </p>
          )}
          {other.ikZoek && !other.zoektNaar?.length && (
            <p className="text-on-surface-variant">
              <span className="text-on-surface font-semibold">Zoekt: </span>
              {other.ikZoek}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages.length === 0 && (
          <p className="text-body-md text-secondary text-center">
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
                <Avatar
                  src={other.avatarUrl}
                  naam={other.naam}
                  size="xs"
                  grayscale={false}
                />
              )}
              <div
                className={`group flex max-w-[80vw] flex-col lg:max-w-md ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-3 text-sm ${
                    isMe
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface rounded-2xl"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-secondary mt-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                  {formatRelative(new Date(msg.createdAt))}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="hairline-t pb-safe flex shrink-0 gap-3 pt-4"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Typ een bericht…"
          className="text-on-surface placeholder:text-secondary bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 flex-1 rounded-xl border border-transparent px-4 py-3 text-base outline-none focus:ring-[3px]"
          disabled={send.isPending}
        />
        <button
          type="submit"
          disabled={!content.trim() || send.isPending}
          className="bg-primary text-on-primary hover:bg-primary/90 px-5 transition-colors disabled:opacity-40"
        >
          {send.isPending ? <Spinner /> : <Send size={16} />}
        </button>
      </form>
    </>
  );
}

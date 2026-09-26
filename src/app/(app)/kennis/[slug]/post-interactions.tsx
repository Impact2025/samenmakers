"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { fieldClasses } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatRelative } from "@/lib/date-utils";
type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    naam: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

interface Props {
  postId: string;
  reactionCount: number;
  comments: Comment[];
}

export function PostInteractions({ postId, reactionCount, comments }: Props) {
  const [commentText, setCommentText] = useState("");
  const utils = trpc.useUtils();

  const react = trpc.posts.react.useMutation({
    onSuccess: () => void utils.posts.bySlug.invalidate(),
  });

  const addComment = trpc.posts.comment.useMutation({
    onSuccess: () => {
      setCommentText("");
      void utils.posts.bySlug.invalidate();
    },
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => react.mutate({ postId })}
          disabled={react.isPending}
          aria-pressed={!!react.data?.liked}
          className={
            react.data?.liked
              ? "bg-primary-fixed text-primary-container flex h-10 items-center gap-2 rounded-full px-4 transition-colors"
              : "bg-surface-container-low text-secondary hover:text-primary-container flex h-10 items-center gap-2 rounded-full px-4 transition-colors"
          }
        >
          <Heart
            size={18}
            className={react.data?.liked ? "fill-current" : ""}
          />
          <span className="text-label-md">{reactionCount}</span>
        </button>
        <span className="bg-surface-container-low text-secondary flex h-10 items-center gap-2 rounded-full px-4">
          <MessageCircle size={18} />
          <span className="text-label-md">
            {comments.length} {comments.length === 1 ? "reactie" : "reacties"}
          </span>
        </span>
      </div>

      <div className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-5">
        <h2 className="text-headline-sm text-on-surface">Reacties</h2>

        {comments.length === 0 && (
          <p className="text-body-md text-secondary">
            Nog geen reacties. Wees de eerste!
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.author.avatarUrl}
              naam={comment.author.naam ?? comment.author.name ?? "?"}
              size="xs"
            />
            <div className="bg-surface-container-low flex-1 rounded-2xl rounded-tl-md p-3">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-label-md text-on-surface">
                  {comment.author.naam ?? comment.author.name}
                </span>
                <span className="text-body-sm text-secondary">
                  {formatRelative(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            addComment.mutate({ postId, content: commentText.trim() });
          }}
          className="flex gap-2 pt-1"
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Schrijf een reactie…"
            aria-label="Schrijf een reactie"
            className={cn(fieldClasses, "flex-1")}
          />
          <Button
            type="submit"
            size="icon"
            className="h-[50px] w-[50px]"
            aria-label="Plaatsen"
            disabled={!commentText.trim() || addComment.isPending}
          >
            {addComment.isPending ? <Spinner size="sm" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </section>
  );
}

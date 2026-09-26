"use client";

import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
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
    <div className="space-y-6">
      {/* Reactions */}
      <div className="hairline-t flex items-center gap-4 pt-4">
        <button
          onClick={() => react.mutate({ postId })}
          disabled={react.isPending}
          className="text-secondary hover:text-primary flex items-center gap-2 transition-colors"
        >
          <Heart
            size={18}
            className={react.data?.liked ? "fill-primary text-primary" : ""}
          />
          <span className="text-label-md">{reactionCount}</span>
        </button>
        <div className="text-secondary flex items-center gap-2">
          <MessageSquare size={18} />
          <span className="text-label-md">{comments.length}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="text-label-md text-on-surface">Reacties</h3>

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
              grayscale={false}
            />
            <div className="bg-surface-container-low flex-1 p-3">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-on-surface text-xs font-semibold">
                  {comment.author.naam ?? comment.author.name}
                </span>
                <span className="text-secondary text-[10px]">
                  {formatRelative(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {/* Comment form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            addComment.mutate({ postId, content: commentText.trim() });
          }}
          className="flex gap-3"
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Schrijf een reactie…"
            className="text-on-surface placeholder:text-secondary bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary-container focus:ring-primary-container/15 flex-1 rounded-xl border border-transparent px-4 py-3 text-sm outline-none focus:ring-[3px]"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!commentText.trim() || addComment.isPending}
          >
            {addComment.isPending ? <Spinner /> : "Plaatsen"}
          </Button>
        </form>
      </div>
    </div>
  );
}

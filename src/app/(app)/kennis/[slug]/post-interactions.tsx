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
      <div className="flex items-center gap-4 hairline-t pt-4">
        <button
          onClick={() => react.mutate({ postId })}
          disabled={react.isPending}
          className="flex items-center gap-2 text-outline hover:text-primary transition-colors"
        >
          <Heart size={18} className={react.data?.liked ? "fill-primary text-primary" : ""} />
          <span className="text-label-caps">{reactionCount}</span>
        </button>
        <div className="flex items-center gap-2 text-outline">
          <MessageSquare size={18} />
          <span className="text-label-caps">{comments.length}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="text-label-caps text-on-surface">REACTIES</h3>

        {comments.length === 0 && (
          <p className="text-body-sm text-outline">Nog geen reacties. Wees de eerste!</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.author.avatarUrl}
              naam={comment.author.naam ?? comment.author.name ?? "?"}
              size="xs"
              grayscale={false}
            />
            <div className="flex-1 bg-surface-container-low p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-on-surface">
                  {comment.author.naam ?? comment.author.name}
                </span>
                <span className="text-[10px] text-outline">
                  {formatRelative(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">{comment.content}</p>
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
            className="flex-1 border border-hairline bg-white px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface"
          />
          <Button type="submit" variant="primary" disabled={!commentText.trim() || addComment.isPending}>
            {addComment.isPending ? <Spinner /> : "Plaatsen"}
          </Button>
        </form>
      </div>
    </div>
  );
}

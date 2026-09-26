"use client";

import { trpc } from "@/trpc/client";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  targetUserId: string;
  expertise: string[];
}

export function ExpertiseEndorsements({ targetUserId, expertise }: Props) {
  const utils = trpc.useUtils();
  const { data: endorsements = [] } = trpc.endorsements.forUser.useQuery({
    targetId: targetUserId,
  });
  const toggle = trpc.endorsements.toggle.useMutation({
    onSuccess: () =>
      void utils.endorsements.forUser.invalidate({ targetId: targetUserId }),
  });

  const endorsementMap = new Map(endorsements.map((e) => [e.skill, e]));

  return (
    <div className="flex flex-wrap gap-2">
      {expertise.map((skill) => {
        const data = endorsementMap.get(skill);
        const count = data?.count ?? 0;
        const endorsed = data?.endorsedByMe ?? false;

        return (
          <button
            key={skill}
            onClick={() => toggle.mutate({ targetId: targetUserId, skill })}
            disabled={toggle.isPending}
            className={cn(
              "text-label-md flex h-8 items-center gap-1.5 rounded-full px-3 transition-all active:scale-95",
              endorsed
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed",
            )}
            title={
              endorsed ? "Endorsement intrekken" : "Endorseer deze expertise"
            }
          >
            {skill}
            {count > 0 && (
              <span
                className={cn(
                  "flex items-center gap-0.5",
                  endorsed ? "text-on-primary/80" : "text-secondary",
                )}
              >
                <ThumbsUp size={10} />
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

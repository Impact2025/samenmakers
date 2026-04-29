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
  const { data: endorsements = [] } = trpc.endorsements.forUser.useQuery({ targetId: targetUserId });
  const toggle = trpc.endorsements.toggle.useMutation({
    onSuccess: () => void utils.endorsements.forUser.invalidate({ targetId: targetUserId }),
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
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all active:scale-95",
              endorsed
                ? "bg-primary text-on-primary border-primary"
                : "border-hairline text-on-surface hover:border-primary hover:text-primary",
            )}
            title={endorsed ? "Endorsement intrekken" : "Endorseer deze expertise"}
          >
            {skill}
            {count > 0 && (
              <span className={cn(
                "flex items-center gap-0.5",
                endorsed ? "text-on-primary/80" : "text-outline",
              )}>
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

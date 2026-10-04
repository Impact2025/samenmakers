import { GraduationCap } from "lucide-react";
import { api } from "@/trpc/server";

const ROLE_LABEL = { docent: "Docent", facilitator: "Facilitator" } as const;

/** "Docent · Leergang …" op een profiel. Verschijnt alleen als iemand echt lesgeeft. */
export async function TeachingBadges({ userId }: { userId: string }) {
  const badges = await api.teaching
    .badges({ userId })
    .catch(() => [] as Awaited<ReturnType<typeof api.teaching.badges>>);
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {badges.map((b) => (
        <span
          key={`${b.program}:${b.role}`}
          className="text-label-sm text-on-surface bg-surface-container flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1.5"
        >
          <span
            className="text-on-primary flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: b.color }}
          >
            <GraduationCap size={12} />
          </span>
          {ROLE_LABEL[b.role]} · {b.program}
        </span>
      ))}
    </div>
  );
}

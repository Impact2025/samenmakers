"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHeart, HelpCircle, Trash2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fieldClasses,
  labelClasses,
  textareaClasses,
} from "@/components/ui/field-styles";
import { formatRelative } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type Post = inferRouterOutputs<AppRouter>["feed"]["list"][number];
type Kind = "hulpvraag" | "aanbod";

const KIND_LABEL: Record<Kind, string> = {
  hulpvraag: "Hulpvraag",
  aanbod: "Aanbod",
};

/** Feed met hulpvragen en aanbiedingen voor een klas (cohortId) of voor alumni (geen cohortId). */
export function FeedPanel({
  cohortId,
  posts,
}: {
  cohortId?: string;
  posts: Post[];
}) {
  const router = useRouter();
  const empty = { kind: "hulpvraag" as Kind, title: "", body: "" };
  const [form, setForm] = useState(empty);
  const create = trpc.feed.create.useMutation({
    onSuccess: () => {
      setForm(empty);
      router.refresh();
    },
  });
  const remove = trpc.feed.remove.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="bg-surface-container-low flex flex-col gap-4 rounded-2xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ ...(cohortId ? { cohortId } : {}), ...form });
        }}
      >
        <h2 className="text-title-md text-on-surface">Plaats een bericht</h2>
        <div className="flex gap-2" role="group" aria-label="Soort bericht">
          {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={form.kind === k}
              onClick={() => setForm((f) => ({ ...f, kind: k }))}
              className={cn(
                "text-label-md rounded-full px-4 py-2 transition-colors",
                form.kind === k
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container text-secondary hover:bg-surface-container-high",
              )}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Titel</span>
          <input
            required
            minLength={3}
            className={fieldClasses}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={
              form.kind === "hulpvraag"
                ? "Wie kan meekijken naar mijn financieringsplan?"
                : "Ik help graag met pitchen"
            }
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Toelichting</span>
          <textarea
            required
            minLength={3}
            rows={4}
            className={textareaClasses}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </label>
        {create.error && (
          <p role="alert" className="text-body-sm text-error">
            {create.error.message}
          </p>
        )}
        <div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Bezig..." : "Plaatsen"}
          </Button>
        </div>
      </form>

      {posts.length === 0 ? (
        <EmptyState
          icon={<HandHeart size={22} />}
          title="Nog geen berichten"
          description="Stel als eerste een vraag of bied je hulp aan."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="bg-surface-container-lowest shadow-card rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={p.author.avatarUrl}
                    naam={p.author.naam}
                    size="xs"
                  />
                  <div className="min-w-0">
                    <p className="text-label-lg text-on-surface truncate">
                      {p.author.naam}
                    </p>
                    <p className="text-body-sm text-secondary">
                      {formatRelative(p.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={p.kind === "hulpvraag" ? "primary" : "tertiary"}
                >
                  {p.kind === "hulpvraag" ? (
                    <HelpCircle size={12} />
                  ) : (
                    <HandHeart size={12} />
                  )}{" "}
                  {KIND_LABEL[p.kind]}
                </Badge>
              </div>
              <h3 className="text-title-md text-on-surface mt-3">{p.title}</h3>
              <p className="text-body-md text-secondary mt-1 whitespace-pre-line">
                {p.body}
              </p>
              {p.canDelete && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm("Dit bericht verwijderen?"))
                        remove.mutate({ postId: p.id });
                    }}
                  >
                    <Trash2 size={14} /> Verwijderen
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {remove.error && (
        <p role="alert" className="text-body-sm text-error">
          {remove.error.message}
        </p>
      )}
    </div>
  );
}

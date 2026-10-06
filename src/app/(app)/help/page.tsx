import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { api } from "@/trpc/server";
import { getPersona } from "@/server/learning/persona";
import { HELP, type HelpAudience } from "@/lib/help-content";
import { PageHeader } from "@/components/shared/page-header";
import { ReplayTourButton } from "@/components/help/replay-tour-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Hulp en veelgestelde vragen" };

const ORDER: HelpAudience[] = [
  "lid",
  "cursist",
  "docent",
  "alumnus",
  "beheerder",
];

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ voor?: string }>;
}) {
  const [{ voor }, persona, me] = await Promise.all([
    searchParams,
    getPersona(),
    api.users.me(),
  ]);
  const isAdmin = me?.role === "admin";

  // Beheerders-FAQ alleen voor admins; de rest is voor iedereen te lezen.
  const audiences = ORDER.filter((a) => a !== "beheerder" || isAdmin);
  const requested = audiences.find((a) => a === voor);
  const active: HelpAudience = requested ?? persona;
  const section = HELP[active];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Hulp"
        title="Veelgestelde vragen"
        description="Kies je rol voor antwoorden die bij jou passen."
        className="mb-0"
        action={active === persona ? <ReplayTourButton /> : undefined}
      />

      <nav
        aria-label="Kies je rol"
        className="bg-surface-container-low inline-flex flex-wrap gap-1 self-start rounded-3xl p-1"
      >
        {audiences.map((a) => (
          <Link
            key={a}
            href={`/help?voor=${a}`}
            aria-current={a === active ? "page" : undefined}
            className={cn(
              "text-label-lg rounded-full px-4 py-1.5 transition-colors",
              a === active
                ? "bg-primary-container text-on-primary shadow-sm"
                : "text-secondary hover:text-on-surface",
            )}
          >
            {HELP[a].label}
            {a !== "beheerder" && a === persona ? " (jij)" : ""}
          </Link>
        ))}
      </nav>

      <p className="text-body-md text-secondary">{section.intro}</p>

      <div className="flex flex-col gap-2">
        {section.faq.map((f) => (
          <details
            key={f.q}
            className="group bg-surface-container-lowest shadow-card rounded-2xl"
          >
            <summary className="text-title-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown
                size={18}
                aria-hidden
                className="text-primary-container shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="text-body-lg text-on-surface-variant px-4 pb-4">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <p className="text-body-md text-secondary">
        Staat je vraag er niet bij? Mail naar{" "}
        <a
          className="text-primary-container hover:underline"
          href="mailto:info@weshapethefuture.nl"
        >
          info@weshapethefuture.nl
        </a>
        .
      </p>
    </div>
  );
}

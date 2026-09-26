import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "E-mail verifiëren" };

export default function VerifieerPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="bg-primary-fixed text-primary-container flex h-14 w-14 items-center justify-center rounded-2xl">
        <MailCheck size={28} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-lg text-on-surface">
          Controleer je inbox
        </h1>
        <p className="text-body-md text-secondary">
          We hebben een verificatielink naar je e-mailadres gestuurd. Klik op de
          link om je account te activeren.
        </p>
      </div>
      <p className="bg-surface-container-low text-body-sm text-secondary w-full rounded-xl p-3">
        Geen e-mail ontvangen? Kijk ook even in je spamfolder.
      </p>
      <Link
        href="/inloggen"
        className={buttonClasses("secondary", "lg", "w-full")}
      >
        Terug naar inloggen
      </Link>
    </div>
  );
}

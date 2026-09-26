import type { Metadata } from "next";
import { MailManager } from "./mail-manager";

export const metadata: Metadata = { title: "Admin — Mailings" };

export default function AdminMailPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-on-surface text-2xl font-extrabold">Mailings</h1>
        <p className="text-secondary mt-1 text-sm">
          E-mailcampagnes naar segmenten — met AI-tekst en live bereik
        </p>
      </div>
      <MailManager />
    </div>
  );
}

import type { Metadata } from "next";
import { MailManager } from "./mail-manager";

export const metadata: Metadata = { title: "Admin — Mailings" };

export default function AdminMailPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg text-on-surface">Mailings</h1>
        <p className="text-secondary mt-1 text-sm">
          E-mailcampagnes naar segmenten — met live bereik
        </p>
      </div>
      <MailManager />
    </div>
  );
}

import type { Metadata } from "next";
import { LedenTabs } from "../leden-tabs";
import { CrmContacts } from "./crm-contacts";

export const metadata: Metadata = { title: "Admin — CRM" };

export default function AdminCrmPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg text-on-surface">Leden</h1>
        <p className="text-secondary mt-1 text-sm">
          Contacten, segmenten en notities
        </p>
      </div>
      <LedenTabs actief="crm" />
      <CrmContacts />
    </div>
  );
}

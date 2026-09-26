import type { Metadata } from "next";
import { CrmContacts } from "./crm-contacts";

export const metadata: Metadata = { title: "Admin — CRM" };

export default function AdminCrmPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-on-surface text-2xl font-extrabold">CRM</h1>
        <p className="text-secondary mt-1 text-sm">
          Contacten, segmenten en activiteiten
        </p>
      </div>
      <CrmContacts />
    </div>
  );
}

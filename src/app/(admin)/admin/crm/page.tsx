import type { Metadata } from "next";
import { CrmContacts } from "./crm-contacts";

export const metadata: Metadata = { title: "Admin — CRM" };

export default function AdminCrmPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-on-surface">CRM</h1>
        <p className="text-sm text-outline mt-1">
          Contacten, segmenten en activiteiten
        </p>
      </div>
      <CrmContacts />
    </div>
  );
}

import type { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — GDPR" };

export default function AdminGdprPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-black text-on-surface">GDPR & Privacy</h1>

      <Card hover={false}>
        <CardHeader><h2 className="text-label-caps text-on-surface">GEGEVENSVERZOEKEN</h2></CardHeader>
        <CardBody>
          <p className="text-body-sm text-on-surface-variant mb-4">
            Gebruikers kunnen een verzoek indienen voor inzage of verwijdering van hun gegevens.
            Verzoeken worden automatisch verwerkt via de API-endpoints.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 hairline-b">
              <div>
                <p className="text-sm font-semibold text-on-surface">Data export endpoint</p>
                <code className="text-xs text-outline">GET /api/gdpr/export</code>
              </div>
              <span className="text-xs text-primary font-semibold">ACTIEF</span>
            </div>
            <div className="flex items-center justify-between py-3 hairline-b">
              <div>
                <p className="text-sm font-semibold text-on-surface">Account verwijdering endpoint</p>
                <code className="text-xs text-outline">DELETE /api/gdpr/account</code>
              </div>
              <span className="text-xs text-primary font-semibold">ACTIEF</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-on-surface">Data bewaarbeleid</p>
                <p className="text-xs text-outline">Geïnactiveerde accounts: 30 dagen bewaard</p>
              </div>
              <span className="text-xs text-outline">Configureerbaar</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card hover={false}>
        <CardHeader><h2 className="text-label-caps text-on-surface">PRIVACY INSTELLINGEN PLATFORM</h2></CardHeader>
        <CardBody className="space-y-3 text-body-sm text-on-surface-variant">
          <p>✓ Wachtwoorden worden gehashed met bcrypt (12 rounds)</p>
          <p>✓ Sessies verlopen na inactiviteit</p>
          <p>✓ Profielzichtbaarheid configureerbaar per gebruiker</p>
          <p>✓ Geblokkeerde gebruikers worden uitgesloten van alle interacties</p>
          <p>✓ Audit log bijgehouden voor admin-acties</p>
          <p>✓ Afbeeldingen opgeslagen op Vercel Blob (geen externe trackers)</p>
        </CardBody>
      </Card>
    </div>
  );
}

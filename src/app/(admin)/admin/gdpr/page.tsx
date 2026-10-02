import type { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin — GDPR" };

export default function AdminGdprPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-headline-lg text-on-surface">GDPR & Privacy</h1>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-headline-sm text-on-surface">
            Gegevensverzoeken
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-body-md text-on-surface-variant mb-4">
            Gebruikers kunnen een verzoek indienen voor inzage of verwijdering
            van hun gegevens. Verzoeken worden automatisch verwerkt via de
            API-endpoints.
          </p>
          <div className="space-y-3">
            <div className="hairline-b flex items-center justify-between py-3">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Data export endpoint
                </p>
                <code className="text-secondary text-xs">
                  GET /api/gdpr/export
                </code>
              </div>
              <span className="text-primary text-xs font-semibold">Actief</span>
            </div>
            <div className="hairline-b flex items-center justify-between py-3">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Volledige data-export (alle tabellen, JSON)
                </p>
                <code className="text-secondary text-xs">
                  GET /api/admin/export
                </code>
              </div>
              <a
                href="/api/admin/export"
                className="text-primary text-xs font-semibold"
              >
                Downloaden
              </a>
            </div>
            <div className="hairline-b flex items-center justify-between py-3">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Account verwijdering endpoint
                </p>
                <code className="text-secondary text-xs">
                  DELETE /api/gdpr/account
                </code>
              </div>
              <span className="text-primary text-xs font-semibold">Actief</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-on-surface text-sm font-semibold">
                  Data bewaarbeleid
                </p>
                <p className="text-secondary text-xs">
                  Geïnactiveerde accounts: 30 dagen bewaard
                </p>
              </div>
              <span className="text-secondary text-xs">Configureerbaar</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-headline-sm text-on-surface">
            Privacy instellingen platform
          </h2>
        </CardHeader>
        <CardBody className="text-body-md text-on-surface-variant space-y-3">
          <p>✓ Wachtwoorden worden gehashed met bcrypt (12 rounds)</p>
          <p>✓ Sessies verlopen na inactiviteit</p>
          <p>✓ Profielzichtbaarheid configureerbaar per gebruiker</p>
          <p>
            ✓ Geblokkeerde gebruikers worden uitgesloten van alle interacties
          </p>
          <p>✓ Audit log bijgehouden voor admin-acties</p>
          <p>
            ✓ Afbeeldingen opgeslagen op Vercel Blob (geen externe trackers)
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

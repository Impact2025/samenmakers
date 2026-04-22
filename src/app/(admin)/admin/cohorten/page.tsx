import type { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CreateCohortForm } from "./create-cohort-form";

export const metadata: Metadata = { title: "Admin — Cohorten" };

export default function AdminCohortenPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-black text-on-surface">Cohorten</h1>
      <p className="text-body text-on-surface-variant">
        Cohorten zijn besloten groepen met een gezamenlijk thema of programma. Leden kunnen worden uitgenodigd via een unieke code.
      </p>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-caps text-on-surface">NIEUW COHORT AANMAKEN</h2>
        </CardHeader>
        <CardBody>
          <CreateCohortForm />
        </CardBody>
      </Card>
    </div>
  );
}

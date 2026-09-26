import type { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CreateCohortForm } from "./create-cohort-form";

export const metadata: Metadata = { title: "Admin — Cohorten" };

export default function AdminCohortenPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-on-surface text-2xl font-extrabold">Cohorten</h1>
      <p className="text-body-md text-on-surface-variant">
        Cohorten zijn besloten groepen met een gezamenlijk thema of programma.
        Leden kunnen worden uitgenodigd via een unieke code.
      </p>

      <Card hover={false}>
        <CardHeader>
          <h2 className="text-label-md text-on-surface">
            Nieuw cohort aanmaken
          </h2>
        </CardHeader>
        <CardBody>
          <CreateCohortForm />
        </CardBody>
      </Card>
    </div>
  );
}

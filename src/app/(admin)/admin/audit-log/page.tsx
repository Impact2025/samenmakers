import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Audit log — Admin" };

const ACTION_LABELS: Record<string, string> = {
  update_user: "Gebruiker bijgewerkt",
  publish_post: "Post gepubliceerd",
  publish_event: "Event gepubliceerd",
  delete_post: "Post verwijderd",
  delete_event: "Event verwijderd",
  resolve_report: "Melding afgehandeld",
  create_cohort: "Cohort aangemaakt",
};

const ACTION_COLORS: Record<string, "default" | "primary"> = {
  update_user: "default",
  publish_post: "primary",
  publish_event: "primary",
  delete_post: "default",
  delete_event: "default",
  resolve_report: "default",
  create_cohort: "primary",
};

export default async function AuditLogPage() {
  const entries = await api.admin.auditLog({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-caps text-outline mb-1">ADMIN</p>
        <h1 className="text-headline-md text-on-surface">Audit log</h1>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardBody className="p-8 text-center">
            <p className="text-body text-on-surface-variant">Nog geen audit-log entries.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-hairline">
            {entries.map((entry) => {
              const label = ACTION_LABELS[entry.action] ?? entry.action;
              const color = ACTION_COLORS[entry.action] ?? "default";
              const adminName = entry.admin?.naam ?? entry.admin?.name ?? entry.adminId;
              const details = entry.details ? tryParseJson(String(entry.details)) : null;
              const timestamp = new Date(entry.createdAt).toLocaleString("nl-NL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={entry.id} className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={color} size="sm">{label}</Badge>
                        <span className="text-body-sm text-outline">
                          door <span className="text-on-surface font-medium">{adminName}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-body-sm text-outline">
                        <span>
                          {entry.targetType && (
                            <>
                              <span className="capitalize">{entry.targetType}</span>
                              {entry.targetId && (
                                <span className="font-mono ml-1 text-xs bg-surface-container px-1 py-0.5">
                                  {entry.targetId.slice(0, 8)}…
                                </span>
                              )}
                            </>
                          )}
                        </span>
                        {details !== null && (
                          <span className="text-xs font-mono text-outline/70">
                            {details}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-body-sm text-outline shrink-0 whitespace-nowrap">
                      {timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function tryParseJson(str: string): string | null {
  try { return JSON.stringify(JSON.parse(str)); } catch { return null; }
}

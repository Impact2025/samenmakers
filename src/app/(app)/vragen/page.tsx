import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare } from "lucide-react";
import { formatRelative } from "@/lib/date-utils";

export const metadata: Metadata = { title: "Q&A" };

export default async function VragenPage() {
  const { items } = await api.questions.list({ limit: 20 });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-label-caps text-outline mb-1">COMMUNITY</p>
          <h1 className="text-headline-md text-on-surface">Vragen & Antwoorden</h1>
        </div>
        <Link href="/vragen/nieuw">
          <Button variant="primary">+ Stel vraag</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 border border-hairline">
            <p className="text-on-surface-variant mb-2">Nog geen vragen gesteld</p>
            <p className="text-body-sm text-outline">Wees de eerste die een vraag stelt aan de community</p>
          </div>
        ) : (
          items.map((q) => (
            <Link key={q.id} href={`/vragen/${q.id}`}>
              <Card>
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 text-center w-10">
                      <span className="text-xl font-black text-on-surface">{q.answers.length}</span>
                      <span className="text-[9px] text-outline uppercase tracking-widest">antw.</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {q.isResolved && (
                          <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                        )}
                        <h3 className="font-black text-on-surface group-hover:text-primary transition-colors">
                          {q.title}
                        </h3>
                      </div>
                      {q.content && (
                        <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">{q.content}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {q.sector && <Badge variant="default" size="sm">{q.sector}</Badge>}
                        {q.isResolved && <Badge variant="primary" size="sm">Opgelost</Badge>}
                        <div className="flex items-center gap-2 ml-auto">
                          <Avatar
                            src={q.author.avatarUrl}
                            naam={q.author.naam ?? q.author.name ?? "?"}
                            size="xs"
                            grayscale={false}
                          />
                          <span className="text-xs text-outline">
                            {q.author.naam ?? q.author.name} · {formatRelative(new Date(q.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

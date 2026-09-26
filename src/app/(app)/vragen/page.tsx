import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { formatRelative } from "@/lib/date-utils";

export const metadata: Metadata = { title: "Q&A" };

export default async function VragenPage() {
  const { items } = await api.questions.list({ limit: 20 });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-md text-secondary mb-1">COMMUNITY</p>
          <h1 className="text-headline-lg text-on-surface">
            Vragen & Antwoorden
          </h1>
        </div>
        <Link href="/vragen/nieuw" className="mt-1 shrink-0">
          <Button size="sm" variant="primary">
            + Vraag
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="border-hairline border py-20 text-center">
            <p className="text-on-surface-variant mb-2">
              Nog geen vragen gesteld
            </p>
            <p className="text-body-md text-secondary">
              Wees de eerste die een vraag stelt aan de community
            </p>
          </div>
        ) : (
          items.map((q) => (
            <Link key={q.id} href={`/vragen/${q.id}`}>
              <Card>
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex w-10 shrink-0 flex-col items-center gap-1 text-center">
                      <span className="text-on-surface text-xl font-extrabold">
                        {q.answers.length}
                      </span>
                      <span className="text-secondary text-[9px] tracking-widest uppercase">
                        antw.
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start gap-2">
                        {q.isResolved && (
                          <CheckCircle
                            size={16}
                            className="text-primary mt-0.5 shrink-0"
                          />
                        )}
                        <h3 className="text-on-surface group-hover:text-primary font-extrabold transition-colors">
                          {q.title}
                        </h3>
                      </div>
                      {q.content && (
                        <p className="text-body-md text-on-surface-variant mb-3 line-clamp-2">
                          {q.content}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        {q.sector && (
                          <Badge variant="default" size="sm">
                            {q.sector}
                          </Badge>
                        )}
                        {q.isResolved && (
                          <Badge variant="primary" size="sm">
                            Opgelost
                          </Badge>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <Avatar
                            src={q.author.avatarUrl}
                            naam={q.author.naam ?? q.author.name ?? "?"}
                            size="xs"
                            grayscale={false}
                          />
                          <span className="text-secondary text-xs">
                            {q.author.naam ?? q.author.name} ·{" "}
                            {formatRelative(new Date(q.createdAt))}
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth/config";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { AnswerSection } from "./answer-section";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const q = await api.questions.byId({ id });
  if (!q) return { title: "Niet gevonden" };
  return { title: q.title };
}

export default async function VraagPage({ params }: Props) {
  const { id } = await params;
  const [question, session] = await Promise.all([
    api.questions.byId({ id }),
    auth(),
  ]);

  if (!question) notFound();

  const isAuthor = session?.user?.id === question.authorId;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Question */}
      <Card hover={false}>
        <CardBody>
          <div className="flex items-start gap-3 mb-4">
            {question.isResolved && (
              <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
            )}
            <h1 className="text-headline-sm text-on-surface">{question.title}</h1>
          </div>

          {question.sector && <Badge variant="default" size="sm" className="mb-3">{question.sector}</Badge>}

          {question.content && (
            <p className="text-body text-on-surface-variant mb-4">{question.content}</p>
          )}

          <div className="flex items-center gap-3 hairline-t pt-4">
            <Avatar
              src={question.author.avatarUrl}
              naam={question.author.naam ?? question.author.name ?? "?"}
              size="xs"
              grayscale={false}
            />
            <span className="text-xs text-outline">
              {question.author.naam ?? question.author.name} · {formatDate(new Date(question.createdAt))}
            </span>
            <span className="ml-auto text-xs text-outline">
              {question.answers.length} antwoord{question.answers.length !== 1 ? "en" : ""}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Answers */}
      <AnswerSection
        questionId={id}
        answers={question.answers}
        isAuthor={isAuthor}
        isResolved={question.isResolved}
      />
    </div>
  );
}

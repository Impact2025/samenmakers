import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth/config";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { CheckCircle, ChevronLeft } from "lucide-react";
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
    <div className="flex flex-col gap-5">
      <Link
        href="/vragen"
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> Community feed
      </Link>

      <article className="bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={question.author.avatarUrl}
            naam={question.author.naam ?? question.author.name ?? "?"}
            size="xs"
            className="!h-10 !w-10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-title-md text-on-surface truncate">
              {question.author.naam ?? question.author.name}
            </p>
            <p className="text-body-sm text-secondary">
              {formatDate(new Date(question.createdAt))}
            </p>
          </div>
          {question.isResolved && (
            <span className="bg-tertiary/10 text-label-sm text-tertiary flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1">
              <CheckCircle size={14} /> Opgelost
            </span>
          )}
        </div>
        {question.sector && (
          <span className="bg-primary-fixed text-label-sm text-on-primary-fixed w-fit rounded-full px-2.5 py-0.5 uppercase">
            {question.sector}
          </span>
        )}
        <h1 className="text-headline-md text-on-surface">{question.title}</h1>
        {question.content && (
          <p className="text-body-lg text-on-surface-variant whitespace-pre-line">
            {question.content}
          </p>
        )}
      </article>

      <AnswerSection
        questionId={id}
        answers={question.answers}
        isAuthor={isAuthor}
        isResolved={question.isResolved}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/date-utils";

type Answer = {
  id: string;
  content: string;
  isAccepted: boolean;
  createdAt: Date;
  author: {
    naam: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

interface Props {
  questionId: string;
  answers: Answer[];
  isAuthor: boolean;
  isResolved: boolean;
}

export function AnswerSection({
  questionId,
  answers,
  isAuthor,
  isResolved,
}: Props) {
  const [answerText, setAnswerText] = useState("");
  const utils = trpc.useUtils();

  const addAnswer = trpc.questions.answer.useMutation({
    onSuccess: () => {
      setAnswerText("");
      void utils.questions.byId.invalidate({ id: questionId });
    },
  });

  const acceptAnswer = trpc.questions.acceptAnswer.useMutation({
    onSuccess: () => void utils.questions.byId.invalidate({ id: questionId }),
  });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-headline-sm text-on-surface">
        {answers.length} {answers.length === 1 ? "reactie" : "reacties"}
      </h2>

      {answers.map((answer) => {
        const naam = answer.author.naam ?? answer.author.name ?? "?";
        return (
          <article
            key={answer.id}
            className={
              answer.isAccepted
                ? "bg-tertiary-fixed/30 ring-tertiary/30 flex flex-col gap-3 rounded-2xl p-5 ring-2"
                : "bg-surface-container-lowest shadow-card flex flex-col gap-3 rounded-2xl p-5"
            }
          >
            <div className="flex items-center gap-2.5">
              <Avatar src={answer.author.avatarUrl} naam={naam} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-label-lg text-on-surface truncate">{naam}</p>
                <p className="text-body-sm text-secondary">
                  {formatDate(new Date(answer.createdAt))}
                </p>
              </div>
              {answer.isAccepted && (
                <span className="bg-tertiary text-label-sm text-on-tertiary flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1">
                  <CheckCircle size={14} /> Beste antwoord
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">
              {answer.content}
            </p>
            {isAuthor && !isResolved && !answer.isAccepted && (
              <Button
                variant="tonal"
                size="sm"
                className="self-start"
                onClick={() =>
                  acceptAnswer.mutate({ answerId: answer.id, questionId })
                }
                disabled={acceptAnswer.isPending}
              >
                <CheckCircle size={16} /> Markeer als beste antwoord
              </Button>
            )}
          </article>
        );
      })}

      {!isResolved && (
        <div className="bg-surface-container-lowest shadow-elevated flex flex-col gap-3 rounded-2xl p-5">
          <p className="text-title-md text-on-surface">Denk mee</p>
          <Textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Deel je kennis en ervaring…"
            rows={4}
            aria-label="Jouw reactie"
          />
          {addAnswer.error && (
            <p className="text-body-sm text-error">{addAnswer.error.message}</p>
          )}
          <Button
            className="self-end"
            onClick={() => {
              if (answerText.trim())
                addAnswer.mutate({ questionId, content: answerText.trim() });
            }}
            disabled={!answerText.trim() || addAnswer.isPending}
          >
            {addAnswer.isPending ? <Spinner size="sm" /> : "Reactie plaatsen"}
          </Button>
        </div>
      )}
    </section>
  );
}

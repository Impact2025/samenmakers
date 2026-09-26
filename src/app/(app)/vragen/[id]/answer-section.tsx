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
    <div className="space-y-4">
      <h2 className="text-label-md text-on-surface">
        ANTWOORDEN ({answers.length})
      </h2>

      {answers.map((answer) => (
        <div
          key={answer.id}
          className={`border p-5 ${answer.isAccepted ? "border-primary bg-primary/5" : "border-hairline bg-white"}`}
        >
          {answer.isAccepted && (
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-primary" />
              <span className="text-label-md text-primary">
                Geaccepteerd antwoord
              </span>
            </div>
          )}
          <p className="text-body-md text-on-surface-variant mb-4">
            {answer.content}
          </p>
          <div className="flex items-center gap-3">
            <Avatar
              src={answer.author.avatarUrl}
              naam={answer.author.naam ?? answer.author.name ?? "?"}
              size="xs"
              grayscale={false}
            />
            <span className="text-secondary text-xs">
              {answer.author.naam ?? answer.author.name} ·{" "}
              {formatDate(new Date(answer.createdAt))}
            </span>
            {isAuthor && !isResolved && !answer.isAccepted && (
              <button
                onClick={() =>
                  acceptAnswer.mutate({ answerId: answer.id, questionId })
                }
                disabled={acceptAnswer.isPending}
                className="text-primary ml-auto flex items-center gap-1.5 text-xs font-semibold hover:underline"
              >
                <CheckCircle size={12} />
                Accepteer antwoord
              </button>
            )}
          </div>
        </div>
      ))}

      {!isResolved && (
        <div className="bg-surface-container-lowest shadow-card space-y-3 rounded-2xl p-5">
          <p className="text-label-md text-on-surface">Geef een antwoord</p>
          <Textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Deel je kennis en ervaring…"
            rows={4}
          />
          {addAnswer.error && (
            <p className="text-error text-sm">{addAnswer.error.message}</p>
          )}
          <Button
            variant="primary"
            onClick={() => {
              if (answerText.trim()) {
                addAnswer.mutate({ questionId, content: answerText.trim() });
              }
            }}
            disabled={!answerText.trim() || addAnswer.isPending}
          >
            {addAnswer.isPending ? <Spinner /> : "Antwoord plaatsen"}
          </Button>
        </div>
      )}
    </div>
  );
}

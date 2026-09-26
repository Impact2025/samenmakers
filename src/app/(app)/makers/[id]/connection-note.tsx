"use client";

import { useState } from "react";
import { StickyNote, Check } from "lucide-react";
import { trpc } from "@/trpc/client";

export function ConnectionNote({ targetUserId }: { targetUserId: string }) {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: note } = trpc.connections.getNote.useQuery({ targetUserId });
  const saveNote = trpc.connections.saveNote.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Opgeslagen notitie één keer overnemen zodra hij binnen is.
  const [loadedNote, setLoadedNote] = useState<string | null>(null);
  if (note?.content && note.content !== loadedNote) {
    setLoadedNote(note.content);
    setContent(note.content);
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <StickyNote size={14} className="text-secondary" />
        <p className="text-label-md text-secondary">PRIVÉNOTITIE</p>
        <span className="text-body-md text-secondary ml-auto">
          {content.length}/1000
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Noteer iets over deze maker... (alleen zichtbaar voor jou)"
        className="bg-surface-container border-hairline text-body-md text-on-surface placeholder:text-secondary focus:border-primary w-full resize-none border px-3 py-2 transition-colors focus:outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => saveNote.mutate({ targetUserId, content })}
          disabled={saveNote.isPending}
          className="text-label-md text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={13} />
              Opgeslagen
            </>
          ) : (
            "Opslaan"
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (note?.content) setContent(note.content);
  }, [note]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <StickyNote size={14} className="text-outline" />
        <p className="text-label-caps text-outline">PRIVÉNOTITIE</p>
        <span className="text-body-sm text-outline ml-auto">{content.length}/1000</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Noteer iets over deze maker... (alleen zichtbaar voor jou)"
        className="w-full bg-surface-container border border-hairline px-3 py-2 text-body text-on-surface placeholder:text-outline resize-none focus:outline-none focus:border-primary transition-colors"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={() => saveNote.mutate({ targetUserId, content })}
          disabled={saveNote.isPending}
          className="flex items-center gap-1.5 text-label-caps text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
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

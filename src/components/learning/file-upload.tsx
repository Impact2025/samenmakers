"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

/** Uploadknop voor huiswerk en lesmateriaal van één editie (POST /api/upload/material). */
export function FileUpload({
  cohortId,
  onUploaded,
  label = "Bestand kiezen",
  disabled,
}: {
  cohortId: string;
  onUploaded: (file: UploadedFile) => void;
  label?: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("cohortId", cohortId);
      form.set("file", file);
      const res = await fetch("/api/upload/material", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as
        | UploadedFile
        | { error?: string };
      if (!res.ok || !("url" in data))
        throw new Error(
          ("error" in data && data.error) || "Uploaden is niet gelukt",
        );
      onUploaded(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uploaden is niet gelukt");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,application/pdf,.docx,.pptx,.xlsx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
      >
        <Paperclip size={14} /> {busy ? "Bezig met uploaden..." : label}
      </Button>
      {error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

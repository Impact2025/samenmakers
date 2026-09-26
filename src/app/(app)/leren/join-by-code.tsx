"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const join = trpc.learning.joinByCode.useMutation({
    onSuccess: ({ cohortId }) => router.push(`/leren/${cohortId}`),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        join.mutate({ code });
      }}
      className="flex items-end gap-4"
    >
      <div className="flex-1">
        <Input
          label="Uitnodigingscode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Bijv. K7M2QX9A"
          autoComplete="off"
          {...(join.error ? { error: join.error.message } : {})}
          required
          minLength={4}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={join.isPending || code.trim().length < 4}
      >
        {join.isPending ? <Spinner size="sm" /> : "Deelnemen"}
      </Button>
    </form>
  );
}

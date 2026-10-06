"use client";

import { useState } from "react";
import { postSiteForm } from "./post-form";

/** Het contactformulier van de site: de velden komen van de pagina, dit verzorgt het versturen. */
export function ContactFormShell({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const val = (k: string) => String(d.get(k) ?? "").trim();
    if (
      val("txtContactFirstName").length < 2 ||
      val("txtContactLastName").length < 2 ||
      !val("txtContactEmail") ||
      val("txtSubject").length < 2 ||
      val("txtMessage").length < 5
    ) {
      alert("Vul alle velden met een * in.");
      return;
    }
    if (!confirm("Weet je zeker dat je dit formulier wilt versturen?")) return;
    setBusy(true);
    const payload = new FormData();
    payload.set("firstName", val("txtContactFirstName"));
    payload.set("lastName", val("txtContactLastName"));
    payload.set("email", val("txtContactEmail"));
    payload.set("phone", val("txtContactPhoneNumber"));
    payload.set("organization", val("txtOrganization"));
    payload.set("subject", val("txtSubject"));
    payload.set("message", val("txtMessage"));
    const result = await postSiteForm("contact", payload);
    setBusy(false);
    if (result.ok) {
      alert(
        "Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.",
      );
      form.reset();
    } else {
      alert(result.error);
    }
  }

  return (
    <form
      className={className}
      id={id}
      onSubmit={(e) => void onSubmit(e)}
      aria-busy={busy}
    >
      {children}
    </form>
  );
}

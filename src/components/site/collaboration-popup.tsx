"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { postSiteForm } from "./post-form";
import { cn } from "@/lib/utils";

export function CollaborationPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("Weet je zeker dat je dit formulier wilt versturen?")) return;
    const form = e.currentTarget;
    setBusy(true);
    const result = await postSiteForm("samenwerken", new FormData(form));
    setBusy(false);
    if (result.ok) {
      alert(
        "Bedankt voor je interesse in samenwerken. We nemen zo snel mogelijk contact met je op.",
      );
      form.reset();
      onClose();
    } else {
      alert(result.error);
    }
  }

  return (
    <div
      className={cn("collaboration-popup", open && "is-open")}
      id="collaborationPopup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborationPopupTitle"
      aria-hidden={!open}
    >
      <div className="collaboration-popup__overlay" onClick={onClose} />
      <div className="collaboration-popup__dialog">
        <button
          className="collaboration-popup__close"
          type="button"
          aria-label="Close collaboration form"
          onClick={onClose}
        >
          <X />
        </button>

        <div className="collaboration-popup__header">
          <p className="collaboration-popup__eyebrow">Samen impact maken</p>
          <h2
            className="collaboration-popup__title"
            id="collaborationPopupTitle"
          >
            Laten we samen de toekomst vormgeven.
          </h2>
          <p className="collaboration-popup__description">
            Heb je een idee of zie je mogelijkheden om elkaar te versterken en
            samen (meer) impact te maken? Vertel ons kort over jezelf, je
            organisatie en wat je voor ogen hebt. We nemen dan snel contact met
            je op voor een kennismaking.
          </p>
        </div>

        <form
          className="collaboration-popup__form"
          onSubmit={(e) => void onSubmit(e)}
        >
          <div className="collaboration-popup__field">
            <label htmlFor="collaborationName">Naam</label>
            <input
              type="text"
              id="collaborationName"
              name="name"
              placeholder="Jouw naam"
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          <div className="collaboration-popup__field">
            <label htmlFor="collaborationEmail">E-mailadres</label>
            <input
              type="email"
              id="collaborationEmail"
              name="email"
              placeholder="jouw e-mailadres"
              required
            />
          </div>
          <div className="collaboration-popup__field">
            <label htmlFor="collaborationOrganisation">Organisatie</label>
            <input
              type="text"
              id="collaborationOrganisation"
              name="organisation"
              placeholder="jouw organisatie"
            />
          </div>
          <div className="collaboration-popup__field">
            <label htmlFor="collaborationMessage">
              Hoe kunnen we samenwerken?
            </label>
            <textarea
              id="collaborationMessage"
              name="message"
              rows={5}
              placeholder="Vertel ons over je idee of mogelijke samenwerking"
              required
              minLength={5}
              maxLength={500}
            />
          </div>
          <button
            className="collaboration-popup__submit"
            type="submit"
            disabled={busy}
          >
            Laten we kennismaken
          </button>
        </form>
      </div>
    </div>
  );
}

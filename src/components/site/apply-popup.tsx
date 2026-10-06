"use client";

import { useEffect, useState } from "react";
import { postSiteForm } from "./post-form";
import { cn } from "@/lib/utils";

export function ApplyPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("Weet je zeker dat je dit formulier wilt versturen?")) return;
    const form = e.currentTarget;
    setBusy(true);
    const result = await postSiteForm("interesse", new FormData(form));
    setBusy(false);
    if (result.ok) {
      alert(
        "Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.",
      );
      form.reset();
      onClose();
    } else {
      alert(result.error);
    }
  }

  return (
    <div
      className={cn("modal-backdrop", open && "active")}
      id="modalBackdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        <div className="modal-header">
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Formulier sluiten"
          >
            &times;
          </button>
          <h2>Interesseformulier</h2>
          <p>Velden met * zijn verplicht.</p>
        </div>

        <form
          className="modal-body"
          id="interestForm"
          onSubmit={(e) => void onSubmit(e)}
        >
          <div className="form-group">
            <label htmlFor="firstName">
              Voornaam <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Vul je voornaam in"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              Achternaam <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Vul je achternaam in"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              E-mailadres <span className="required-asterisk">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Vul je e-mailadres in"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefoonnummer</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Vul je telefoonnummer in"
            />
          </div>
          <div className="form-group">
            <label htmlFor="organization">Organisatie</label>
            <input type="text" id="organization" name="organization" />
          </div>
          <div className="form-group">
            <label htmlFor="program">
              Programma <span className="required-asterisk">*</span>
            </label>
            <select id="program" name="program" required defaultValue="">
              <option value="" disabled>
                Selecteer een programma
              </option>
              <option value="SocialEntrepreneurship">
                Leergang Sociaal Ondernemen
              </option>
              <option value="SocialIntrapreneurship">
                Leergang Social Intrapreneurship
              </option>
              <option value="ReshapingYourFuture">Reshaping Your Future</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="subject">
              Onderwerp <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">
              Bericht <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={5}
              maxLength={500}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={busy}>
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            <span className="btn-text">
              {busy ? "Verzenden..." : "Verzenden"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

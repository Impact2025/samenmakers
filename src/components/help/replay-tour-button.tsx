"use client";

import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { START_TOUR_EVENT } from "./help-launcher";

export function ReplayTourButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))}
      className={buttonClasses("tonal", "sm")}
    >
      <Compass size={16} aria-hidden /> Rondleiding opnieuw bekijken
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApplyPopup } from "./apply-popup";
import { CollaborationPopup } from "./collaboration-popup";

type Popups = { openApply: () => void; openCollab: () => void };

const Ctx = createContext<Popups | null>(null);

export function useSitePopups(): Popups {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSitePopups buiten SitePopupsProvider");
  return ctx;
}

export function SitePopupsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);

  const openApply = useCallback(() => setApplyOpen(true), []);
  const openCollab = useCallback(() => setCollabOpen(true), []);
  const value = useMemo(
    () => ({ openApply, openCollab }),
    [openApply, openCollab],
  );

  useEffect(() => {
    document.body.classList.toggle("is-collaboration-open", collabOpen);
    return () => document.body.classList.remove("is-collaboration-open");
  }, [collabOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCollabOpen(false);
        setApplyOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CollaborationPopup
        open={collabOpen}
        onClose={() => setCollabOpen(false)}
      />
      <ApplyPopup open={applyOpen} onClose={() => setApplyOpen(false)} />
    </Ctx.Provider>
  );
}

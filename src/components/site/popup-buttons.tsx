"use client";

import { useSitePopups } from "./site-popups";

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
>;

/** Opent het interesseformulier ("Meld je aan"). */
export function ApplyButton(props: ButtonProps) {
  const { openApply } = useSitePopups();
  return <button type="button" {...props} onClick={openApply} />;
}

/** Opent het samenwerkingsformulier. */
export function CollabButton(props: ButtonProps) {
  const { openCollab } = useSitePopups();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      {...props}
      onClick={openCollab}
    />
  );
}

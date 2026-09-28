"use client";

import { Spinner } from "@/components/ui/spinner";

const btn =
  "flex w-full h-12 items-center justify-center gap-3 rounded-full bg-surface-container-lowest border border-surface-container text-label-lg text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50";

export type OAuthProviders = { google: boolean; linkedin: boolean };

export function OAuthButtons({
  verb,
  loading,
  onSelect,
  providers,
}: {
  verb: "Doorgaan" | "Aanmelden";
  loading: string | null;
  onSelect: (provider: "google" | "linkedin") => void;
  /** Alleen providers die op de server geconfigureerd zijn; de rest verbergen we. */
  providers: OAuthProviders;
}) {
  if (!providers.google && !providers.linkedin) return null;
  return (
    <div className="flex flex-col gap-3">
      {providers.google && (
        <button
          type="button"
          onClick={() => onSelect("google")}
          disabled={!!loading}
          className={btn}
        >
          {loading === "google" ? (
            <Spinner size="sm" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
          )}
          {verb} met Google
        </button>
      )}
      {providers.linkedin && (
        <button
          type="button"
          onClick={() => onSelect("linkedin")}
          disabled={!!loading}
          className={btn}
        >
          {loading === "linkedin" ? (
            <Spinner size="sm" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="#0A66C2"
              aria-hidden
            >
              <path d="M16.2 0H1.8C.81 0 0 .81 0 1.8v14.4C0 17.19.81 18 1.8 18h14.4c.99 0 1.8-.81 1.8-1.8V1.8C18 .81 17.19 0 16.2 0zM5.4 15.3H2.7V6.75h2.7V15.3zM4.05 5.58a1.575 1.575 0 110-3.15 1.575 1.575 0 010 3.15zM15.3 15.3h-2.7v-4.185c0-1.008-.018-2.304-1.404-2.304-1.404 0-1.62 1.098-1.62 2.232V15.3H6.876V6.75h2.592v1.188h.036c.36-.684 1.242-1.404 2.556-1.404 2.736 0 3.24 1.8 3.24 4.14V15.3z" />
            </svg>
          )}
          {verb} met LinkedIn
        </button>
      )}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-hairline h-px flex-1" />
      <span className="text-label-md text-secondary">of met e-mail</span>
      <div className="bg-hairline h-px flex-1" />
    </div>
  );
}

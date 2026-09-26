import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface relative flex min-h-screen flex-col overflow-hidden">
      {/* Zachte merkgloed */}
      <div className="bg-primary-container/10 pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-tertiary/10 pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl" />

      <header className="pt-safe relative">
        <div className="flex h-16 items-center px-5">
          <Link href="/" aria-label="We Shape the Future — home">
            <Logo wordmark="always" />
          </Link>
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 py-8">
        <div className="bg-surface-container-lowest shadow-elevated w-full max-w-md rounded-3xl p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

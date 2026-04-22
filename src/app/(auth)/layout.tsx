import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="px-6 py-5 hairline-b bg-white">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface">
          SAMENMAKERS
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

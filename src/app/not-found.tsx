import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="text-center max-w-sm">
        <p className="text-[120px] font-black text-outline/10 leading-none select-none mb-6">404</p>
        <h1 className="text-headline-sm text-on-surface mb-3">Pagina niet gevonden</h1>
        <p className="text-body text-on-surface-variant mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary text-on-primary font-bold text-label-caps hover:bg-primary/90 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-hairline text-on-surface font-bold text-label-caps hover:border-on-surface transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

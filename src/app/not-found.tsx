import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="max-w-sm text-center">
        <p className="text-secondary/10 mb-6 text-[120px] leading-none font-extrabold select-none">
          404
        </p>
        <h1 className="text-headline-md text-on-surface mb-3">
          Pagina niet gevonden
        </h1>
        <p className="text-body-md text-on-surface-variant mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-primary text-on-primary text-label-md hover:bg-primary/90 shadow-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="text-on-surface text-label-md hover:bg-surface-container-low border-surface-container bg-surface-container-lowest inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-bold transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

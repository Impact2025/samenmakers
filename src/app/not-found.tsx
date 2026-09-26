import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Logo wordmark="always" />
        <p className="text-primary-container/15 font-display text-[96px] leading-none font-extrabold select-none">
          404
        </p>
        <h1 className="text-headline-lg text-on-surface">
          Pagina niet gevonden
        </h1>
        <p className="text-body-md text-secondary">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <Link href="/dashboard" className={buttonClasses("primary", "lg")}>
            Naar home
          </Link>
          <Link href="/" className={buttonClasses("secondary", "lg")}>
            Startpagina
          </Link>
        </div>
      </div>
    </div>
  );
}

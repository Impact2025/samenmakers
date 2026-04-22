import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Aanmelden" };

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-md text-on-surface mb-2">Word onderdeel van Samenmakers</h1>
        <p className="text-body text-on-surface-variant">
          Vind je medemissie-ondernemer en bouw samen aan een betere wereld
        </p>
      </div>
      <RegisterForm {...(ref ? { referralCode: ref } : {})} />
    </div>
  );
}

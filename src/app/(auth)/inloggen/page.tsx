import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Inloggen" };

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-md text-on-surface mb-2">Welkom terug</h1>
        <p className="text-body text-on-surface-variant">Log in op je Samenmakers account</p>
      </div>
      <LoginForm />
    </div>
  );
}

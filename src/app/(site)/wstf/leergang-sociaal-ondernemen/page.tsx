import type { Metadata } from "next";
import { LeergangSoContent, meta } from "@/components/site/pages/leergang-so";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <LeergangSoContent />;
}

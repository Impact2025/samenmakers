import type { Metadata } from "next";
import { LeergangSiContent, meta } from "@/components/site/pages/leergang-si";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <LeergangSiContent />;
}

import type { Metadata } from "next";
import { AnnuleringContent, meta } from "@/components/site/pages/annulering";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <AnnuleringContent />;
}

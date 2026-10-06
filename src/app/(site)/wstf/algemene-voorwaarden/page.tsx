import type { Metadata } from "next";
import { VoorwaardenContent, meta } from "@/components/site/pages/voorwaarden";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <VoorwaardenContent />;
}

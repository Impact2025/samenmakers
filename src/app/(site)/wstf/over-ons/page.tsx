import type { Metadata } from "next";
import { AboutContent, meta } from "@/components/site/pages/about";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <AboutContent />;
}

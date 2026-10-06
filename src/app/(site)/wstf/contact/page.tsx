import type { Metadata } from "next";
import { ContactContent, meta } from "@/components/site/pages/contact";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <ContactContent />;
}

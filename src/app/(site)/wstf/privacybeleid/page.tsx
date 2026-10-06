import type { Metadata } from "next";
import { PrivacyContent, meta } from "@/components/site/pages/privacy";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <PrivacyContent />;
}

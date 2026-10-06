import type { Metadata } from "next";
import { CommunityContent, meta } from "@/components/site/pages/community";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <CommunityContent />;
}

import type { Metadata } from "next";
import { ReshapingContent, meta } from "@/components/site/pages/reshaping";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <ReshapingContent />;
}

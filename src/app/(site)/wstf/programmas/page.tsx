import type { Metadata } from "next";
import { ProgrammasContent, meta } from "@/components/site/pages/programmas";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <ProgrammasContent />;
}

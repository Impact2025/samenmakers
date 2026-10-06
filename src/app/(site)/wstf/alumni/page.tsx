import type { Metadata } from "next";
import { AlumniContent, meta } from "@/components/site/pages/alumni";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return <AlumniContent />;
}

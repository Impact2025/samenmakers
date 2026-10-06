import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INTERVIEWS } from "@/components/site/pages/interviews";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(INTERVIEWS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const load = INTERVIEWS[slug];
  if (!load) return {};
  const { meta } = await load();
  return { title: meta.title, description: meta.description };
}

export default async function InterviewPage({ params }: Props) {
  const { slug } = await params;
  const load = INTERVIEWS[slug];
  if (!load) notFound();
  const { InterviewContent } = await load();
  return <InterviewContent />;
}

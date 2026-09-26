import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ChevronLeft } from "lucide-react";
import { api } from "@/trpc/server";
import { LessonEditor } from "./lesson-editor";

export const metadata: Metadata = { title: "Beheer — les bewerken" };

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const lesson = await api.programs
    .lessonById({ id: lessonId })
    .catch((e: unknown) => {
      if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
      throw e;
    });

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/admin/programmas/${id}`}
        className="text-label-md text-secondary hover:text-primary-container inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft size={16} /> {lesson.module.program.name}
      </Link>
      <p className="text-label-sm text-secondary uppercase">
        {lesson.module.title}
      </p>
      <LessonEditor lesson={lesson} programId={id} />
    </div>
  );
}

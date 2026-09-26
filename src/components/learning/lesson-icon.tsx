import { FileText, Video, Download, NotebookPen, Radio } from "lucide-react";

const icons = {
  tekst: FileText,
  video: Video,
  bestand: Download,
  reflectie: NotebookPen,
  live: Radio,
} as const;

export function LessonIcon({
  type,
  size = 16,
}: {
  type: string;
  size?: number;
}) {
  const Icon = icons[type as keyof typeof icons] ?? FileText;
  return <Icon size={size} strokeWidth={1.5} aria-hidden />;
}

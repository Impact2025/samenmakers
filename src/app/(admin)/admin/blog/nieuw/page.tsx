import type { Metadata } from "next";
import { BlogEditor } from "../blog-editor";

export const metadata: Metadata = { title: "Admin — Nieuw artikel" };

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-on-surface">Nieuw artikel</h1>
      <BlogEditor />
    </div>
  );
}

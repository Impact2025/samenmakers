import type { Metadata } from "next";
import { TRPCError } from "@trpc/server";
import { Lock } from "lucide-react";
import { api } from "@/trpc/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FeedPanel } from "@/components/community/feed-panel";

export const metadata: Metadata = { title: "Alumni" };

// Null = geen toegang (alleen alumni).
async function load() {
  try {
    return await api.feed.list({});
  } catch (e) {
    if (e instanceof TRPCError && e.code === "FORBIDDEN") return null;
    throw e;
  }
}

export default async function AlumniPage() {
  const posts = await load();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Alumni"
        title="Alumni-community"
        description="Hulpvragen en aanbiedingen van en voor alumni."
        className="mb-0"
      />
      {posts === null ? (
        <EmptyState
          icon={<Lock size={22} />}
          title="Beschikbaar na afronding van je opleiding"
          description="De alumni-community is er voor wie de leergang heeft afgerond."
        />
      ) : (
        <FeedPanel posts={posts} />
      )}
    </div>
  );
}

import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <TopBar />
      <div className="flex-1 pt-16">{children}</div>
      <Footer />
    </div>
  );
}

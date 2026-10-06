import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SitePopupsProvider } from "@/components/site/site-popups";
import { SiteBehaviors } from "@/components/site/site-behaviors";
import "./wstf.css";
import "./events.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wstf">
      <SitePopupsProvider>
        <main className="page">
          <SiteHeader />
          {children}
          <SiteFooter />
        </main>
        <SiteBehaviors />
      </SitePopupsProvider>
    </div>
  );
}

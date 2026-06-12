import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GovBanner } from "@/components/gov-banner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GovBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

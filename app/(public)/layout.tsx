import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9]">
      <PublicHeader />
      <main className="w-full pt-16 flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

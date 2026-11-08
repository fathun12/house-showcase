import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/features/auth/session";
import { Sidebar } from "@/ui/admin/Sidebar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="md:grid md:grid-cols-[16rem_1fr]">
      <Sidebar />
      <main className="gutter min-w-0 py-10">{children}</main>
    </div>
  );
}
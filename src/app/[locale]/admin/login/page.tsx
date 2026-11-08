import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/ui/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main className="gutter mx-auto flex min-h-dvh max-w-page flex-col justify-center py-16">
      <p className="label text-accent">{t("eyebrow")}</p>
      <h1 className="heading mt-4 text-7xl">{t("title")}</h1>
      <hr className="my-8 max-w-md border-t-2 border-foreground" />
      <LoginForm />
    </main>
  );
}
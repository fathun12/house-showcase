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
    <main className="gutter mx-auto flex min-h-dvh max-w-page items-center py-10">
      <div className="grid w-full md:grid-cols-2">
        <aside className="flex min-h-[26rem] flex-col justify-between bg-foreground p-8 text-background md:min-h-[34rem] md:p-10">
          <p className="flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span className="heading text-xl">House Showcase</span>
          </p>

          <div>
            <h2 className="heading text-4xl text-balance md:text-5xl">
              {t("panelTitle")}
            </h2>
            <ol className="label mt-8 flex flex-col gap-2 border-t border-background/40 pt-6">
              <li>01 / {t("point1")}</li>
              <li>02 / {t("point2")}</li>
              <li>03 / {t("point3")}</li>
            </ol>
          </div>
        </aside>

        <section className="flex flex-col justify-center p-8 md:p-12">
          <p className="label text-accent">{t("eyebrow")}</p>
          <h1 className="heading mt-3 text-5xl md:text-6xl">{t("title")}</h1>
          <div className="mt-10">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
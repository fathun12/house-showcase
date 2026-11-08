import { setRequestLocale } from "next-intl/server";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="gutter mx-auto max-w-page py-16">
      <p className="label text-accent">00 / Setup</p>
      <h1 className="heading mt-4 text-6xl">House Showcase</h1>
      <hr className="my-8 border-t-2 border-foreground" />
      <div className="flex flex-wrap gap-4">
        <ThemeSwitch />
        <LocaleSwitch />
      </div>
    </main>
  );
}
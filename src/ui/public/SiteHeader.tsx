import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

export function SiteHeader() {
  const t = useTranslations("public.header");

  return (
    <header className="border-b-2 border-foreground">
      <div className="gutter mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="heading text-xl hover:text-accent">
          {t("home")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeSwitch />
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}
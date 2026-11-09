import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

export function SiteFooter() {
  const t = useTranslations("public.footer");
  const tHeader = useTranslations("public.header");
  const tTheme = useTranslations("common.theme");
  const tLanguage = useTranslations("common.language");

  return (
    <footer className="mt-12 border-t-2 border-foreground">
      <div className="gutter mx-auto grid max-w-page gap-10 py-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
        <div className="max-w-sm">
          <p className="flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span className="heading text-xl">{tHeader("home")}</span>
          </p>
          <p className="mt-3 text-sm text-muted">{t("about")}</p>
        </div>

        <nav aria-label={t("links")} className="label flex flex-col gap-3">
          <Link href="/" className="hover:text-accent">
            {t("home")}
          </Link>
          <Link href="/admin" className="hover:text-accent">
            {t("admin")}
          </Link>
        </nav>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="label text-muted">{tTheme("label")}</p>
            <ThemeSwitch />
          </div>
          <div className="flex flex-col gap-2">
            <p className="label text-muted">{tLanguage("label")}</p>
            <LocaleSwitch />
          </div>
        </div>
      </div>

      <div className="border-t border-foreground">
        <p className="gutter mx-auto max-w-page py-6 text-sm text-muted">
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
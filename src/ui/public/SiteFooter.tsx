import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

/** Closes the page like the title block of a drawing sheet: one framed box cut into cells.
 *  The box is the line color and the cells are the page color, so a 2 px gap draws every
 *  divider by itself, in any layout. */
export function SiteFooter() {
  const t = useTranslations("public.footer");
  const tHeader = useTranslations("public.header");
  const tTheme = useTranslations("common.theme");
  const tLanguage = useTranslations("common.language");

  return (
    <footer className="gutter mx-auto mt-16 max-w-page pb-8">
      <div className="grid gap-0.5 border-2 border-foreground bg-foreground md:grid-cols-2 lg:grid-cols-[5fr_2fr_3fr_2fr]">
        <div className="bg-background p-6">
          <p className="flex items-center gap-3">
            <span aria-hidden className="size-3 bg-accent" />
            <span className="heading text-2xl">{tHeader("home")}</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted">{t("about")}</p>
        </div>

        <nav aria-label={t("links")} className="bg-background p-6">
          <p className="label text-muted">{t("links")}</p>
          <ul className="label mt-2 flex flex-col">
            <li>
              <Link href="/" className="flex min-h-11 items-center hover:text-accent">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link href="/admin" className="flex min-h-11 items-center hover:text-accent">
                {t("admin")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="bg-background p-6">
          <p className="label text-muted">{tTheme("label")}</p>
          <div className="mt-3">
            <ThemeSwitch />
          </div>
        </div>

        <div className="bg-background p-6">
          <p className="label text-muted">{tLanguage("label")}</p>
          <div className="mt-3">
            <LocaleSwitch />
          </div>
        </div>

        <p className="bg-background p-6 text-sm text-muted md:col-span-2 lg:col-span-4">
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
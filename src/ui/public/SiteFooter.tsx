import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { whatsappHref } from "@/lib/utils/whatsapp";
import { LocaleSwitch } from "@/ui/shared/LocaleSwitch";
import { ThemeSwitch } from "@/ui/shared/ThemeSwitch";

/** Open footer: only rules, no frames. The name is the one big thing, and the
 *  columns carry numbered mono labels, like the sections of the page do. */
export function SiteFooter() {
  const t = useTranslations("public.footer");
  const tHeader = useTranslations("public.header");
  const tTheme = useTranslations("common.theme");
  const tLanguage = useTranslations("common.language");
  const tWhatsapp = useTranslations("public.whatsapp");
  const whatsapp = whatsappHref(tWhatsapp("generic"));

  return (
    <footer className="gutter mx-auto mt-24 max-w-page">
      <div className="border-t-2 border-foreground pt-12 pb-12">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          <div className="md:col-span-3 lg:col-span-5">
            <p className="flex items-center gap-4">
              <span aria-hidden className="size-4 bg-accent" />
              <span className="heading text-3xl md:text-4xl">{tHeader("home")}</span>
            </p>
            <p className="mt-5 max-w-sm text-muted">{t("about")}</p>
          </div>

          <nav aria-label={t("links")} className="lg:col-span-2">
            <p className="label text-muted">
              <span className="text-accent">01</span> / {t("links")}
            </p>
            <ul className="label mt-2 flex flex-col">
              <li>
                <Link href="/" className="flex min-h-11 items-center hover:text-accent">
                  {t("home")}
                </Link>
              </li>
              {whatsapp ? (
                <li>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center hover:text-accent"
                  >
                    {tWhatsapp("button")} ↗
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/admin" className="flex min-h-11 items-center hover:text-accent">
                  {t("admin")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="label text-muted">
              <span className="text-accent">02</span> / {tTheme("label")}
            </p>
            <div className="mt-3">
              <ThemeSwitch />
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="label text-muted">
              <span className="text-accent">03</span> / {tLanguage("label")}
            </p>
            <div className="mt-3">
              <LocaleSwitch />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-foreground py-6">
        <p className="max-w-3xl text-sm text-muted">{t("disclaimer")}</p>
      </div>
    </footer>
  );
}
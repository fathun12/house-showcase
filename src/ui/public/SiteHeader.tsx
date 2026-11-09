import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("public.header");

  return (
    <header className="border-b-2 border-foreground">
      <div className="gutter mx-auto flex max-w-page items-center py-4">
        <Link href="/" className="flex items-center gap-3 hover:text-accent">
          <span aria-hidden className="size-3 bg-accent" />
          <span className="heading text-xl">{t("home")}</span>
        </Link>
      </div>
    </header>
  );
}
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("public.footer");

  return (
    <footer className="mt-12 border-t-2 border-foreground">
      <p className="gutter mx-auto max-w-page py-8 text-sm text-muted">
        {t("disclaimer")}
      </p>
    </footer>
  );
}
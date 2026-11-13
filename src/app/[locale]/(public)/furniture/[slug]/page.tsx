import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPublishedFurniture } from "@/features/furniture/queries";
import { buildFurnitureContent } from "@/features/furniture/view";
import { FurniturePage } from "@/ui/public/FurniturePage";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Safety net: admin changes also refresh this page immediately
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getPublishedFurniture(slug);

  if (!item) return {};

  const content = buildFurnitureContent(item, locale);
  const description = content.tagline || undefined;

  return {
    title: content.title,
    description,
    openGraph: {
      title: content.title,
      description,
      images: content.hero
        ? [{ url: content.hero.src, width: content.hero.width, height: content.hero.height }]
        : undefined,
    },
  };
}

export default async function FurnitureRoutePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getPublishedFurniture(slug);

  if (!item) notFound();

  return <FurniturePage content={buildFurnitureContent(item, locale)} />;
}
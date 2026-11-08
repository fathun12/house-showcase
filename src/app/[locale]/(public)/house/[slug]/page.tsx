import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPublishedHouse, getPublishedHouses } from "@/features/houses/queries";
import { buildHouseContent, buildSummaryRows } from "@/features/houses/view";
import { HousePage } from "@/ui/public/HousePage";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Safety net: admin changes also refresh this page immediately
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const house = await getPublishedHouse(slug);

  if (!house) return {};

  const content = buildHouseContent(house, locale);
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

export default async function HouseRoutePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [house, houses] = await Promise.all([
    getPublishedHouse(slug),
    getPublishedHouses(),
  ]);

  if (!house) notFound();

  return (
    <HousePage
      content={buildHouseContent(house, locale)}
      compare={buildSummaryRows(houses, locale)}
    />
  );
}
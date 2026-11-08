import { setRequestLocale } from "next-intl/server";
import { getPublishedHouse, getPublishedHouses } from "@/features/houses/queries";
import { buildHouseContent, buildSummaryRows } from "@/features/houses/view";
import { Compare } from "@/ui/public/Compare";
import { HousePage } from "@/ui/public/HousePage";

// Safety net: admin changes also refresh this page immediately
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const houses = await getPublishedHouses();

  if (houses.length === 1) {
    const house = await getPublishedHouse(houses[0].slug);

    if (house) {
      return <HousePage content={buildHouseContent(house, locale)} compare={[]} />;
    }
  }

  return (
    <div className="gutter mx-auto max-w-page py-16">
      <Compare as="h1" rows={buildSummaryRows(houses, locale)} />
    </div>
  );
}
import { setRequestLocale } from "next-intl/server";
import { getPublishedFurniture, getPublishedFurnitureList } from "@/features/furniture/queries";
import { buildFurnitureContent, buildFurnitureRows } from "@/features/furniture/view";
import { getPublishedHouse, getPublishedHouses } from "@/features/houses/queries";
import { buildHouseContent, buildSummaryRows } from "@/features/houses/view";
import { Compare } from "@/ui/public/Compare";
import { FurnitureList } from "@/ui/public/FurnitureList";
import { FurniturePage } from "@/ui/public/FurniturePage";
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

  const [houses, furniture] = await Promise.all([
    getPublishedHouses(),
    getPublishedFurnitureList(),
  ]);

  // Exactly one published project: open it directly
  if (houses.length === 1 && furniture.length === 0) {
    const house = await getPublishedHouse(houses[0].slug);

    if (house) {
      return <HousePage content={buildHouseContent(house, locale)} compare={[]} />;
    }
  }

  if (houses.length === 0 && furniture.length === 1) {
    const item = await getPublishedFurniture(furniture[0].slug);

    if (item) {
      return <FurniturePage content={buildFurnitureContent(item, locale)} />;
    }
  }

  // Several projects (or none): a list of houses and a list of furniture
  const showHouses = houses.length > 0 || furniture.length === 0;

  return (
    <div className="gutter mx-auto max-w-page py-16">
      {showHouses ? <Compare as="h1" rows={buildSummaryRows(houses, locale)} /> : null}
      {furniture.length > 0 ? (
        <FurnitureList
          rows={buildFurnitureRows(furniture, locale)}
          as={showHouses ? "h2" : "h1"}
        />
      ) : null}
    </div>
  );
}
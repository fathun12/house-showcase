import { getLocale, getTranslations } from "next-intl/server";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { listRooms } from "@/features/rooms/queries";
import { Link } from "@/lib/i18n/navigation";
import { pickLocalized } from "@/lib/utils/format";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";
import { buttonStyles } from "@/ui/primitives/Button";
import { Table, Td, Th } from "@/ui/primitives/Table";

export default async function AdminRoomsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseOrNotFound(id);
  const t = await getTranslations("admin.rooms");
  const locale = await getLocale();
  const rooms = await listRooms(id);

  return (
    <FormShell
      eyebrow={`${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`}
      title={t("eyebrow")}
      actions={
        <Link href={`/admin/houses/${id}/rooms/new`} className={buttonStyles("primary")}>
          {t("new")}
        </Link>
      }
    >
      <HouseTabs houseId={id} active="rooms" />

      {rooms.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>{t("columns.number")}</Th>
              <Th>{t("columns.name")}</Th>
              <Th>{t("columns.floor")}</Th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <tr key={room.id}>
                <Td className="font-mono text-sm">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td>
                  <Link
                    href={`/admin/houses/${id}/rooms/${room.id}`}
                    className="font-bold underline underline-offset-4 hover:text-accent"
                  >
                    {pickLocalized(locale, room.name_id, room.name_en)}
                  </Link>
                </Td>
                <Td className="font-mono text-sm">{room.floor ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </FormShell>
  );
}
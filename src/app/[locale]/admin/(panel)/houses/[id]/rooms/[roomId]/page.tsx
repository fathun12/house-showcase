import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getHouseOrNotFound, isUuid } from "@/features/houses/queries";
import { deleteRoom } from "@/features/rooms/actions";
import { getRoom } from "@/features/rooms/queries";
import { pickLocalized } from "@/lib/utils/format";
import { DeleteRoom } from "@/ui/admin/DeleteRoom";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";
import { RoomForm } from "@/ui/admin/RoomForm";

export default async function AdminRoomEditPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id, roomId } = await params;
  const house = await getHouseOrNotFound(id);
  const t = await getTranslations("admin.roomForm");
  const locale = await getLocale();
  const eyebrow = `${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`;

  if (roomId === "new") {
    return (
      <FormShell eyebrow={eyebrow} title={t("newTitle")}>
        <HouseTabs houseId={id} active="rooms" />
        <RoomForm houseId={id} room={null} />
      </FormShell>
    );
  }

  if (!isUuid(roomId)) notFound();

  const room = await getRoom(id, roomId);
  if (!room) notFound();

  return (
    <FormShell eyebrow={eyebrow} title={t("editTitle")}>
      <HouseTabs houseId={id} active="rooms" />
      <RoomForm houseId={id} room={room} />
      <DeleteRoom action={deleteRoom.bind(null, id, room.id)} />
    </FormShell>
  );
}
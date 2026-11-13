import { getTranslations } from "next-intl/server";
import { deleteHouse } from "@/features/houses/actions";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { DeleteHouse } from "@/ui/admin/DeleteHouse";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseForm } from "@/ui/admin/HouseForm";
import { HouseTabs } from "@/ui/admin/HouseTabs";

export default async function AdminFurnitureEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.furnitureForm");

  if (id === "new") {
    return (
      <FormShell eyebrow={t("eyebrow")} title={t("newTitle")}>
        <HouseForm house={null} kind="furniture" />
      </FormShell>
    );
  }

  const house = await getHouseOrNotFound(id, "furniture");

  return (
    <FormShell eyebrow={t("eyebrow")} title={t("editTitle")}>
      <HouseTabs houseId={house.id} active="details" kind="furniture" />
      <HouseForm house={house} kind="furniture" />
      <DeleteHouse action={deleteHouse.bind(null, house.id, "furniture")} kind="furniture" />
    </FormShell>
  );
}
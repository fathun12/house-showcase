import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { deleteHouse } from "@/features/houses/actions";
import { getHouseById, isUuid } from "@/features/houses/queries";
import { DeleteHouse } from "@/ui/admin/DeleteHouse";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseForm } from "@/ui/admin/HouseForm";

export default async function AdminHouseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.houseForm");

  if (id === "new") {
    return (
      <FormShell eyebrow={t("eyebrow")} title={t("newTitle")}>
        <HouseForm house={null} />
      </FormShell>
    );
  }

  if (!isUuid(id)) notFound();

  const house = await getHouseById(id);
  if (!house) notFound();

  return (
    <FormShell eyebrow={t("eyebrow")} title={t("editTitle")}>
      <HouseForm house={house} />
      <DeleteHouse action={deleteHouse.bind(null, house.id)} />
    </FormShell>
  );
}
import { getLocale, getTranslations } from "next-intl/server";
import { listFilesWithTokens } from "@/features/files/queries";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { pickLocalized } from "@/lib/utils/format";
import { FileItem } from "@/ui/admin/FileItem";
import { FileUploader } from "@/ui/admin/FileUploader";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";

export default async function AdminFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseOrNotFound(id, "house");
  const t = await getTranslations("admin.files");
  const locale = await getLocale();
  const files = await listFilesWithTokens(id);

  return (
    <FormShell
      eyebrow={`${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`}
      title={t("title")}
    >
      <HouseTabs houseId={id} active="files" />
      <FileUploader houseId={id} />

      {files.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}

      {files.map((file, index) => (
        <FileItem key={file.id} file={file} number={String(index + 1).padStart(2, "0")} />
      ))}
    </FormShell>
  );
}
import { mediaUrl } from "@/features/media/url";
import { createPublicClient } from "@/lib/supabase/server";

// Public and read only: published houses and furniture with their cover and documentation photos.
// It is used by the owner's portfolio site. Drafts are never listed.
// Address of a furniture page, after the language. CHECK this against the real route (src\app\[locale]\(public)).
const FURNITURE_PATH = "furniture";

type MediaRow = { kind: string; storage_path: string; position: number; created_at: string };
type Row = {
  slug: string;
  kind: "house" | "furniture";
  title_id: string;
  title_en: string;
  tagline_id: string;
  tagline_en: string;
  media: MediaRow[];
};

const byPosition = (a: MediaRow, b: MediaRow) => a.position - b.position || a.created_at.localeCompare(b.created_at);

export async function GET(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get("limit"));
  const limit = Number.isInteger(raw) && raw >= 1 ? Math.min(raw, 12) : 12;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("houses")
      .select("slug, kind, title_id, title_en, tagline_id, tagline_en, media(kind, storage_path, position, created_at)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Row[];
    const projects = rows.slice(0, limit).map((row) => {
      const media = [...row.media].sort(byPosition);
      const hero = media.find((m) => m.kind === "hero");
      const docs = media.filter((m) => m.kind === "room" || m.kind === "gallery");
      // No hero image: the first documentation photo becomes the cover.
      const cover = hero ?? docs[0] ?? null;
      const photos = docs.filter((m) => m !== cover).slice(0, 12);
      return {
        slug: row.slug,
        kind: row.kind,
        titleId: row.title_id,
        titleEn: row.title_en,
        taglineId: row.tagline_id,
        taglineEn: row.tagline_en,
        cover: cover ? mediaUrl(cover.storage_path) : null,
        photos: photos.map((m) => mediaUrl(m.storage_path)),
        path: row.kind === "furniture" ? `/${FURNITURE_PATH}/${row.slug}` : `/house/${row.slug}`,
      };
    });
    return Response.json(
      { total: rows.length, projects },
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (e) {
    console.error("public projects endpoint failed:", (e as Error).message);
    return Response.json({ error: "Could not read the projects." }, { status: 500 });
  }
}
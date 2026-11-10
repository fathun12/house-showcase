import { useTranslations } from "next-intl";
import type { HouseContent, SummaryRow } from "@/features/houses/view";
import { buildSlides, buildViewerItems } from "@/features/viewer/items";
import { whatsappHref } from "@/lib/utils/whatsapp";
import { Compare } from "@/ui/public/Compare";
import { FloorPlan } from "@/ui/public/FloorPlan";
import { GalleryStrip } from "@/ui/public/GalleryStrip";
import { Hero } from "@/ui/public/Hero";
import { ImageViewer } from "@/ui/public/ImageViewer";
import { Notes } from "@/ui/public/Notes";
import { RoomPreview } from "@/ui/public/RoomPreview";
import { RoomSection } from "@/ui/public/RoomSection";
import { SectionIndex } from "@/ui/public/SectionIndex";
import { SectionTitle } from "@/ui/public/SectionTitle";

type Section = { id: string; label: string };

type Props = {
  content: HouseContent;
  /** All published houses; the comparison only shows when there are two or more */
  compare: SummaryRow[];
};

export function HousePage({ content, compare }: Props) {
  const t = useTranslations("public");

  const facts = [
    content.facts.floors !== null && t("facts.floors", { count: content.facts.floors }),
    content.facts.bedrooms !== null && t("facts.bedrooms", { count: content.facts.bedrooms }),
    content.facts.bathrooms !== null && t("facts.bathrooms", { count: content.facts.bathrooms }),
    content.facts.area !== null && t("facts.area", { count: content.facts.area }),
  ].filter((fact): fact is string => Boolean(fact));

  const sections = [
    content.floorplans.length > 0 && { id: "floorplan", label: t("nav.floorplan") },
    content.rooms.length > 0 && { id: "rooms", label: t("nav.rooms") },
    content.why && { id: "why", label: t("nav.why") },
    content.notes && { id: "notes", label: t("nav.notes") },
    content.gallery.length > 0 && { id: "gallery", label: t("nav.gallery") },
    compare.length > 1 && { id: "compare", label: t("nav.compare") },
  ]
    .filter((section): section is Section => Boolean(section))
    .map((section, index) => ({
      ...section,
      number: String(index + 1).padStart(2, "0"),
    }));

  const specRows = [
    content.facts.area !== null && {
      label: t("summary.area"),
      value: String(content.facts.area),
    },
    content.facts.floors !== null && {
      label: t("summary.floors"),
      value: String(content.facts.floors),
    },
    content.facts.bedrooms !== null && {
      label: t("summary.bedrooms"),
      value: String(content.facts.bedrooms),
    },
    content.facts.bathrooms !== null && {
      label: t("summary.bathrooms"),
      value: String(content.facts.bathrooms),
    },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  const numberOf = (id: string) => sections.find((section) => section.id === id)?.number ?? "";
  const has = (id: string) => sections.some((section) => section.id === id);
  const first = sections[0];

  const viewerItems = buildViewerItems(content);
  const generalHref = whatsappHref(t("whatsapp.house", { house: content.title }));
  const roomHref = (name: string) =>
    whatsappHref(t("whatsapp.room", { room: name, house: content.title }));

  return (
    <ImageViewer
      items={viewerItems}
      title={content.title}
      tagline={content.tagline}
      facts={content.facts}
    >
      <Hero
        brand={t("header.home")}
        title={content.title}
        tagline={content.tagline}
        facts={facts}
        image={content.hero}
        next={first ? { href: `#${first.id}`, label: `${first.number} / ${first.label}` } : null}
        whatsapp={generalHref ? { href: generalHref, label: t("whatsapp.button") } : null}
        present={buildSlides(viewerItems).length > 0 ? { label: t("present.start") } : null}
      />

      {content.rooms.length > 0 ? (
        <RoomPreview
          title={t("nav.rooms")}
          rooms={content.rooms.map((room) => ({
            anchor: room.anchor,
            number: room.number,
            name: room.name,
            description: room.description,
            photos: room.photos,
            floorLabel: room.floor !== null ? t("rooms.floor", { floor: room.floor }) : null,
          }))}
        />
      ) : null}

      {sections.length > 0 ? (
        <div className="gutter mx-auto max-w-page pt-10 lg:grid lg:grid-cols-[12rem_1fr] lg:gap-12">
          <SectionIndex
            label={t("nav.label")}
            items={sections}
            rooms={content.rooms}
            specs={{
              title: t("specs.title"),
              rows: specRows,
              designByLabel: t("specs.designBy"),
              designer: content.designer,
            }}
          />

          <div className="min-w-0">
            {has("floorplan") ? (
              <FloorPlan
                number={numberOf("floorplan")}
                plans={content.floorplans}
                rooms={content.rooms}
              />
            ) : null}

            {has("rooms") ? (
              <section id="rooms" className="group scroll-mt-20 pb-6">
                <SectionTitle number={numberOf("rooms")}>{t("rooms.title")}</SectionTitle>
                <div className="mt-8">
                  {content.rooms.map((room) => (
                    <RoomSection
                      key={room.id}
                      room={room}
                      floorLabel={
                        room.floor !== null ? t("rooms.floor", { floor: room.floor }) : null
                      }
                      rationaleLabel={t("rooms.rationale")}
                      commentHref={roomHref(room.name)}
                      commentLabel={t("whatsapp.button")}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {has("why") ? (
              <Notes
                id="why"
                number={numberOf("why")}
                title={t("why.title")}
                body={content.why}
              />
            ) : null}

            {has("notes") ? (
              <Notes
                id="notes"
                number={numberOf("notes")}
                title={t("notes.title")}
                body={content.notes}
                emphasis
                signature={[content.title, ...facts].join(" / ")}
              />
            ) : null}

            {has("compare") ? (
              <Compare
                rows={compare}
                currentSlug={content.slug}
                number={numberOf("compare")}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {has("gallery") ? (
        <section id="gallery" className="group gutter mx-auto max-w-page scroll-mt-20 pt-6 pb-16">
          <SectionTitle number={numberOf("gallery")}>{t("gallery.title")}</SectionTitle>
          <div className="mt-6">
            <GalleryStrip images={content.gallery} />
          </div>
        </section>
      ) : null}
    </ImageViewer>
  );
}
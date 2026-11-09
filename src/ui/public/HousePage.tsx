import Image from "next/image";
import { useTranslations } from "next-intl";
import type { HouseContent, SummaryRow } from "@/features/houses/view";
import { Compare } from "@/ui/public/Compare";
import { FloorPlan } from "@/ui/public/FloorPlan";
import { Hero } from "@/ui/public/Hero";
import { Notes } from "@/ui/public/Notes";
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

  const numberOf = (id: string) => sections.find((section) => section.id === id)?.number ?? "";
  const has = (id: string) => sections.some((section) => section.id === id);
  const first = sections[0];

  return (
    <>
      <Hero
        brand={t("header.home")}
        title={content.title}
        tagline={content.tagline}
        facts={facts}
        image={content.hero}
        next={first ? { href: `#${first.id}`, label: `${first.number} / ${first.label}` } : null}
      />

      {sections.length > 0 ? (
        <div className="gutter mx-auto max-w-page pt-10 lg:grid lg:grid-cols-[12rem_1fr] lg:gap-12">
          <SectionIndex label={t("nav.label")} items={sections} />

          <div className="min-w-0">
            {has("floorplan") ? (
              <FloorPlan
                number={numberOf("floorplan")}
                plans={content.floorplans}
                rooms={content.rooms}
              />
            ) : null}

            {has("rooms") ? (
              <section
                id="rooms"
                className="scroll-mt-20 border-t-2 border-foreground pt-12 pb-6 first:border-t-0"
              >
                <SectionTitle number={numberOf("rooms")}>{t("rooms.title")}</SectionTitle>
                <div className="mt-8">
                  {content.rooms.map((room, index) => (
                    <RoomSection
                      key={room.id}
                      room={room}
                      flip={index % 2 === 1}
                      floorLabel={
                        room.floor !== null ? t("rooms.floor", { floor: room.floor }) : null
                      }
                      rationaleLabel={t("rooms.rationale")}
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
              />
            ) : null}

            {has("gallery") ? (
              <section
                id="gallery"
                className="scroll-mt-20 border-t-2 border-foreground py-12 first:border-t-0"
              >
                <SectionTitle number={numberOf("gallery")}>{t("gallery.title")}</SectionTitle>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {content.gallery.map((image) => (
                    <figure key={image.src} className="reveal">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw"
                        className="h-auto w-full border border-foreground"
                      />
                      {image.caption ? (
                        <figcaption className="label mt-2 text-muted">{image.caption}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
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
    </>
  );
}
import { useTranslations } from "next-intl";
import { buildFurnitureViewerItems } from "@/features/furniture/view";
import type { FurnitureContent } from "@/features/furniture/view";
import { isValidWhatsapp } from "@/lib/utils/whatsapp";
import { FurnitureSpecs } from "@/ui/public/FurnitureSpecs";
import { GalleryStrip } from "@/ui/public/GalleryStrip";
import { Hero } from "@/ui/public/Hero";
import { ImageViewer } from "@/ui/public/ImageViewer";
import { ModelSection } from "@/ui/public/ModelSection";
import { Notes } from "@/ui/public/Notes";
import { SectionIndex } from "@/ui/public/SectionIndex";
import { SectionTitle } from "@/ui/public/SectionTitle";
import type { Spec } from "@/ui/public/ViewerPanel";

type Section = { id: string; label: string };

export function FurniturePage({ content }: { content: FurnitureContent }) {
  const t = useTranslations("public");
  const { dimensions } = content;
  const unit = t("furniture.specs.unit");

  // A size line in the hero only when all three numbers exist: a half size would mislead
  const sizeText =
    dimensions.length && dimensions.width && dimensions.height
      ? `${[dimensions.length, dimensions.width, dimensions.height].join(" \u00d7 ")} ${unit}`
      : "";
  const facts = [sizeText, content.material].filter(Boolean);

  const specRows = [
    dimensions.length && {
      label: t("furniture.specs.length"),
      value: `${dimensions.length} ${unit}`,
    },
    dimensions.width && {
      label: t("furniture.specs.width"),
      value: `${dimensions.width} ${unit}`,
    },
    dimensions.height && {
      label: t("furniture.specs.height"),
      value: `${dimensions.height} ${unit}`,
    },
    content.material && { label: t("furniture.specs.material"), value: content.material },
    content.finish && { label: t("furniture.specs.finish"), value: content.finish },
  ].filter((row): row is Spec => Boolean(row));

  const sections = [
    content.models.length > 0 && { id: "model", label: t("furniture.nav.model") },
    specRows.length > 0 && { id: "specs", label: t("furniture.nav.specs") },
    content.why && { id: "why", label: t("furniture.nav.why") },
    content.notes && { id: "notes", label: t("furniture.nav.notes") },
    content.gallery.length > 0 && { id: "gallery", label: t("nav.gallery") },
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
    <ImageViewer
      items={buildFurnitureViewerItems(content)}
      title={content.title}
      tagline={content.tagline}
      specs={specRows}
    >
      <Hero
        brand={t("header.home")}
        title={content.title}
        tagline={content.tagline}
        facts={facts}
        image={content.hero}
        next={first ? { href: `#${first.id}`, label: `${first.number} / ${first.label}` } : null}
        whatsapp={
          isValidWhatsapp(content.whatsapp)
            ? {
                number: content.whatsapp,
                message: t("furniture.whatsapp", { item: content.title }),
                label: t("whatsapp.button"),
              }
            : null
        }
        present={null}
        designer={
          content.designer ? { label: t("specs.designBy"), name: content.designer } : null
        }
      />

      {sections.length > 0 ? (
        <div className="gutter mx-auto max-w-page pt-10 lg:grid lg:grid-cols-[12rem_1fr] lg:gap-12">
          <SectionIndex
            label={t("nav.label")}
            items={sections}
            rooms={[]}
            specs={{
              title: t("specs.title"),
              rows: specRows,
              designByLabel: t("specs.designBy"),
              designer: content.designer,
            }}
          />

          <div className="min-w-0">
            {has("model") ? (
              <section id="model" className="group scroll-mt-20 pb-12">
                <SectionTitle number={numberOf("model")}>{t("furniture.model.title")}</SectionTitle>
                <div className="mt-8">
                  <ModelSection models={content.models} />
                </div>
              </section>
            ) : null}

            {has("specs") ? (
              <section id="specs" className="group scroll-mt-20 pb-12">
                <SectionTitle number={numberOf("specs")}>{t("furniture.specs.title")}</SectionTitle>
                <FurnitureSpecs
                  dimensions={content.dimensions}
                  material={content.material}
                  finish={content.finish}
                />
              </section>
            ) : null}

            {has("why") ? (
              <Notes
                id="why"
                number={numberOf("why")}
                title={t("furniture.why.title")}
                body={content.why}
              />
            ) : null}

            {has("notes") ? (
              <Notes
                id="notes"
                number={numberOf("notes")}
                title={t("furniture.notes.title")}
                body={content.notes}
                emphasis
                signature={[content.title, ...facts].join(" / ")}
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
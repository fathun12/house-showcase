"use client";

import { useTranslations } from "next-intl";
import type { ViewerItem, ViewerJump } from "@/features/viewer/items";
import { cn } from "@/lib/utils/cn";

export type Spec = { label: string; value: string };

type Props = {
  item: ViewerItem;
  title: string;
  tagline: string;
  specs: Spec[];
  jumps: ViewerJump[];
  onJump: (key: string) => void;
};

/** The design information next to the picture: what it is, why it is designed that way,
 *  and the house specifications. Remounted per picture, so it always starts at the top. */
export function ViewerPanel({ item, title, tagline, specs, jumps, onJump }: Props) {
  const t = useTranslations("public");
  const { kind, room, image } = item;

  const kindLabels = {
    hero: t("viewer.kinds.hero"),
    floorplan: t("viewer.kinds.floorplan"),
    room: t("viewer.kinds.room"),
    gallery: t("viewer.kinds.gallery"),
  };

  let heading = title;
  if (room) heading = room.name;
  else if (kind === "floorplan") heading = t("floorplan.title");
  else if (kind === "gallery") heading = t("gallery.title");

  const context =
    room && room.floor !== null
      ? `${kindLabels.room} · ${t("rooms.floor", { floor: room.floor })}`
      : heading === title
        ? kindLabels[kind]
        : `${kindLabels[kind]} · ${title}`;

  return (
    <aside
      aria-label={t("viewer.infoPanel")}
      className="max-h-[45dvh] shrink-0 overflow-y-auto border-t-2 border-foreground bg-background lg:max-h-none lg:w-104 lg:border-t-0 lg:border-l-2"
    >
      <div className="p-6">
        <p className="label text-muted">{context}</p>
        {room ? (
          <p className="mt-4 font-mono text-5xl font-bold text-accent">{room.number}</p>
        ) : null}
        <h2 className={cn("heading text-3xl", room ? "mt-2" : "mt-4")}>{heading}</h2>

        {kind === "hero" && tagline ? <p className="mt-4 text-lg">{tagline}</p> : null}
        {image.caption ? <p className="label mt-4 text-muted">{image.caption}</p> : null}

        {room?.description ? (
          <p className="mt-6 whitespace-pre-line">{room.description}</p>
        ) : null}

        {room?.rationale ? (
          <div className="mt-6 border-l-4 border-accent pl-5">
            <p className="label text-accent">{t("rooms.rationale")}</p>
            <p className="mt-2 whitespace-pre-line">{room.rationale}</p>
          </div>
        ) : null}
      </div>

      {kind === "floorplan" && jumps.length > 0 ? (
        <nav aria-label={t("viewer.jump")} className="pb-6">
          <p className="label px-6 text-muted">{t("viewer.jump")}</p>
          <ul className="mt-2 border-t-2 border-foreground">
            {jumps.map((jump) => (
              <li key={jump.key}>
                <button
                  type="button"
                  onClick={() => onJump(jump.key)}
                  className="label flex min-h-11 w-full items-center gap-3 border-b border-foreground px-6 text-left hover:bg-surface"
                >
                  <span className="text-accent">{jump.number}</span>
                  <span>{jump.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {specs.length > 0 ? (
        <section className="px-6 pb-8">
          <p className="label text-muted">{t("viewer.specs")}</p>
          <dl className="mt-2 border-t-2 border-foreground">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-4 border-b border-foreground py-2.5"
              >
                <dt className="label text-muted">{spec.label}</dt>
                <dd className="font-mono">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </aside>
  );
}
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ImageView, RoomView } from "@/features/houses/view";
import { SectionTitle } from "@/ui/public/SectionTitle";

type Props = {
  number: string;
  plans: ImageView[];
  rooms: RoomView[];
};

export function FloorPlan({ number, plans, rooms }: Props) {
  const t = useTranslations("public.floorplan");

  return (
    <section
      id="floorplan"
      className="scroll-mt-20 border-t-2 border-foreground py-12 first:border-t-0"
    >
      <SectionTitle number={number}>{t("title")}</SectionTitle>

      <div className="mt-8 flex flex-col gap-8">
        {plans.map((plan) => (
          <figure key={plan.src} className="reveal border-2 border-foreground">
            <Image
              src={plan.src}
              alt={plan.alt}
              width={plan.width}
              height={plan.height}
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="h-auto w-full"
            />
            {plan.caption ? (
              <figcaption className="label border-t-2 border-foreground p-3">
                {plan.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {rooms.length > 0 ? (
        <div className="mt-8">
          <p className="label text-muted">{t("legend")}</p>
          <ol className="mt-3 grid border-t-2 border-foreground sm:grid-cols-2 sm:gap-x-10">
            {rooms.map((room) => (
              <li key={room.id}>
                <a
                  href={`#${room.anchor}`}
                  className="label flex gap-3 border-b border-foreground py-3 hover:bg-surface"
                >
                  <span className="text-accent">{room.number}</span>
                  <span>{room.name}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
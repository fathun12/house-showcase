import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ImageView, RoomView } from "@/features/houses/view";
import { SectionTitle } from "@/ui/public/SectionTitle";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  number: string;
  plans: ImageView[];
  rooms: RoomView[];
};

export function FloorPlan({ number, plans, rooms }: Props) {
  const t = useTranslations("public.floorplan");

  return (
    <section id="floorplan" className="group scroll-mt-20 pb-12">
      <SectionTitle number={number}>{t("title")}</SectionTitle>

      <div className="mt-8 flex flex-col gap-8">
        {plans.map((plan) => (
          <Reveal as="figure" kind="fade" key={plan.src} className="border-2 border-foreground">
            <ViewerTrigger itemKey={plan.src}>
              <Image
                src={plan.src}
                alt={plan.alt}
                width={plan.width}
                height={plan.height}
                sizes="(min-width: 1280px) 1184px, 100vw"
                className="h-auto w-full"
              />
            </ViewerTrigger>
            {plan.caption ? (
              <figcaption className="label border-t-2 border-foreground p-3">
                {plan.caption}
              </figcaption>
            ) : null}
          </Reveal>
        ))}
      </div>

      {rooms.length > 0 ? (
        <div className="mt-8 lg:hidden">
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
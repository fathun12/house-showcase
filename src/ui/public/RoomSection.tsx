import Image from "next/image";
import type { RoomView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  room: RoomView;
  floorLabel: string | null;
  rationaleLabel: string;
};

/** One layout for every room: photos full width on top, then number and name on the left, text on the right. */
export function RoomSection({ room, floorLabel, rationaleLabel }: Props) {
  const hasPhotos = room.photos.length > 0;

  return (
    <article
      id={room.anchor}
      className="scroll-mt-20 border-t-2 border-foreground py-16 first:border-t-0 md:py-24"
    >
      {hasPhotos ? (
        <div className="flex flex-col gap-6">
          {room.photos.map((photo) => (
            <Reveal
              as="figure"
              kind="fade"
              key={photo.src}
              className="overflow-hidden border border-foreground"
            >
              <ViewerTrigger itemKey={photo.src}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1280px) 1184px, 100vw"
                  className="h-auto w-full"
                />
              </ViewerTrigger>
              {photo.caption ? (
                <figcaption className="label border-t border-foreground px-3 py-2 text-muted">
                  {photo.caption}
                </figcaption>
              ) : null}
            </Reveal>
          ))}
        </div>
      ) : null}

      <div className={cn("grid gap-8 md:grid-cols-12 md:gap-12", hasPhotos && "mt-10")}>
        <Reveal className="md:col-span-4">
          <p className="room-number w-fit font-mono text-7xl font-bold text-accent md:text-8xl">
            {room.number}
          </p>
          <h3 className="heading mt-4 text-3xl md:text-4xl">{room.name}</h3>
          {floorLabel ? <p className="label mt-3 text-muted">{floorLabel}</p> : null}
        </Reveal>

        <Reveal className="md:col-span-8">
          {room.description ? (
            <p className="max-w-[65ch] text-lg whitespace-pre-line">{room.description}</p>
          ) : null}

          {room.rationale ? (
            <div className="mt-8 max-w-[65ch] border-l-4 border-accent pl-5">
              <p className="label text-accent">{rationaleLabel}</p>
              <p className="mt-2 whitespace-pre-line">{room.rationale}</p>
            </div>
          ) : null}
        </Reveal>
      </div>
    </article>
  );
}
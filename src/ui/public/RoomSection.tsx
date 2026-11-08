import Image from "next/image";
import type { RoomView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";

type Props = {
  room: RoomView;
  floorLabel: string | null;
  rationaleLabel: string;
  /** Alternates photo and text sides down the page */
  flip: boolean;
};

export function RoomSection({ room, floorLabel, rationaleLabel, flip }: Props) {
  const hasPhotos = room.photos.length > 0;

  return (
    <article
      id={room.anchor}
      className="grid scroll-mt-20 gap-8 border-t border-foreground py-10 md:grid-cols-12 md:gap-12"
    >
      {hasPhotos ? (
        <div className={cn("flex flex-col gap-6 md:col-span-7", flip && "md:order-2")}>
          {room.photos.map((photo) => (
            <figure key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto w-full border border-foreground"
              />
              {photo.caption ? (
                <figcaption className="label mt-2 text-muted">{photo.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          hasPhotos ? "md:col-span-5" : "md:col-span-8",
          flip && hasPhotos && "md:order-1",
        )}
      >
        <p className="font-mono text-6xl font-bold text-accent md:text-7xl">{room.number}</p>
        <h3 className="heading mt-3 text-3xl md:text-4xl">{room.name}</h3>
        {floorLabel ? <p className="label mt-3 text-muted">{floorLabel}</p> : null}

        {room.description ? (
          <p className="mt-6 text-lg whitespace-pre-line">{room.description}</p>
        ) : null}

        {room.rationale ? (
          <div className="mt-8 border-l-4 border-accent pl-5">
            <p className="label text-accent">{rationaleLabel}</p>
            <p className="mt-2 whitespace-pre-line">{room.rationale}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
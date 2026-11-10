import Image from "next/image";
import type { RoomView } from "@/features/houses/view";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";
import { WhatsappLink } from "@/ui/public/WhatsappLink";
import { Reveal } from "@/ui/shared/Reveal";

type Props = {
  room: RoomView;
  floorLabel: string | null;
  rationaleLabel: string;
  /** WhatsApp comment about this room; null when no number is set */
  comment: { number: string; message: string; label: string } | null;
};

/** One layout for every room: photos on the left, number and text on the right. */
export function RoomSection({ room, floorLabel, rationaleLabel, comment }: Props) {
  const hasPhotos = room.photos.length > 0;

  return (
    <article
      id={room.anchor}
      className="grid scroll-mt-20 gap-8 border-t border-foreground py-10 md:grid-cols-12 md:gap-12"
    >
      {hasPhotos ? (
        <div className="flex flex-col gap-6 md:col-span-8">
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
                  sizes="(min-width: 1280px) 720px, (min-width: 768px) 62vw, 100vw"
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

      <Reveal
        className={
          hasPhotos ? "md:sticky md:top-24 md:col-span-4 md:self-start" : "md:col-span-8"
        }
      >
        <p className="room-number w-fit font-mono text-6xl font-bold text-accent md:text-7xl">
          {room.number}
        </p>
        <h3 className="heading mt-3 text-3xl md:text-4xl">{room.name}</h3>
        {floorLabel ? <p className="label mt-3 text-muted">{floorLabel}</p> : null}

        {room.description ? (
          <p className="mt-6 max-w-[65ch] text-lg whitespace-pre-line">{room.description}</p>
        ) : null}

        {room.rationale ? (
          <div className="mt-8 border-l-4 border-accent pl-5">
            <p className="label text-accent">{rationaleLabel}</p>
            <p className="mt-2 whitespace-pre-line">{room.rationale}</p>
          </div>
        ) : null}

        {comment ? (
          <WhatsappLink
            number={comment.number}
            message={comment.message}
            anchor={room.anchor}
            label={comment.label}
            className="mt-8"
          />
        ) : null}
      </Reveal>
    </article>
  );
}
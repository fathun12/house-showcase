"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";
import { SlideRow } from "@/ui/public/SlideRow";

type Item = {
  anchor: string;
  number: string;
  name: string;
  description: string;
  floorLabel: string | null;
  photos: ImageView[];
};

type Props = {
  title: string;
  rooms: Item[];
};

const SWAP_MS = 5000;
const AUTO_MS = 8000;

/** Photos of one card swap by themselves. The start is staggered so cards never swap together. */
function CyclingPhotos({ photos, offset }: { photos: ImageView[]; offset: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => setActive((current) => (current + 1) % photos.length), SWAP_MS);
    }, offset);

    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [photos.length, offset]);

  return (
    <div className="absolute inset-0">
      {photos.map((photo, index) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 544px, (min-width: 640px) 448px, 78vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-out",
            index === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

/** Section 1: one landscape card per room. A click jumps to that room in the room tour below.
 *  The hover behaviour (grow, neighbours step aside) lives in globals.css under .rail-card. */
export function RoomPreview({ title, rooms }: Props) {
  return (
    <section aria-label={title} className="gutter mx-auto max-w-page pt-10">
      <SlideRow
        autoMs={AUTO_MS}
        heading={<h2 className="heading text-3xl md:text-4xl">{title}</h2>}
      >
        {rooms.map((room, index) => {
          const hasPhotos = room.photos.length > 0;

          return (
            <div key={room.anchor} className="rail-slot shrink-0 snap-start px-2">
            <a
              href={`#${room.anchor}`}
              draggable={false}
              className="rail-card relative block aspect-video w-[78vw] overflow-hidden bg-stage text-stage-ink sm:w-112 lg:w-136"
            >
              {hasPhotos ? (
                <>
                  <CyclingPhotos photos={room.photos} offset={index * 1200} />
                  <span className="absolute top-0 left-0 bg-accent px-3 py-1.5 font-mono text-sm font-bold text-accent-ink">
                    {room.number}
                  </span>
                </>
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center pb-16 font-mono text-9xl font-bold text-accent"
                >
                  {room.number}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-stage p-4 text-stage-ink">
                <div className="flex items-start justify-between gap-3">
                  <p className="heading text-xl">{room.name}</p>
                  <span aria-hidden className="font-mono text-accent">
                    →
                  </span>
                </div>
                {room.floorLabel ? <p className="label mt-1 opacity-70">{room.floorLabel}</p> : null}
                {room.description ? (
                  <p className="mt-1 line-clamp-1 text-sm opacity-80">{room.description}</p>
                ) : null}
              </div>
            </a>
            </div>
          );
        })}
      </SlideRow>
    </section>
  );
}
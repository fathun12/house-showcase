"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageView } from "@/features/houses/view";
import { cn } from "@/lib/utils/cn";
import { Rail } from "@/ui/public/Rail";

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

const SWAP_MS = 4000;

/** The photos of one card swap by themselves. The start is staggered so cards never swap together. */
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
    <div className="relative aspect-4/3 overflow-hidden bg-surface">
      {photos.map((photo, index) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 640px) 288px, 256px"
          className={cn(
            "object-cover transition-opacity duration-700 ease-out",
            index === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

/** Preview row of the rooms. A card jumps to its room in the detail section below.
 *  The hover behaviour (grow, neighbours step aside) lives in globals.css under .rail-card. */
export function RoomPreview({ title, rooms }: Props) {
  return (
    <section aria-label={title} className="gutter mx-auto max-w-page pt-10">
      <Rail heading={<h2 className="heading text-3xl md:text-4xl">{title}</h2>}>
        {rooms.map((room, index) => (
          <a
            key={room.anchor}
            href={`#${room.anchor}`}
            className="rail-card relative block w-64 shrink-0 snap-start border-2 border-foreground bg-background sm:w-72"
          >
            <div className="relative">
              <CyclingPhotos photos={room.photos} offset={index * 900} />
              <span className="absolute top-0 left-0 bg-accent px-2 py-1 font-mono text-sm font-bold text-accent-ink">
                {room.number}
              </span>
            </div>

            <div className="border-t-2 border-foreground p-4">
              <p className="heading text-xl">{room.name}</p>
              {room.floorLabel ? (
                <p className="label mt-2 text-muted">{room.floorLabel}</p>
              ) : null}
              {room.description ? (
                <p className="mt-2 line-clamp-2 text-sm">{room.description}</p>
              ) : null}
            </div>
          </a>
        ))}
      </Rail>
    </section>
  );
}
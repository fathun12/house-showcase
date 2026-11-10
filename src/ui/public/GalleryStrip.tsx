import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { SlideRow } from "@/ui/public/SlideRow";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";

type Props = {
  images: ImageView[];
};

const AUTO_MS = 8000;

/** Section 3: the photo collection as a sliding row of landscape cards. A click opens the viewer. */
export function GalleryStrip({ images }: Props) {
  return (
    <SlideRow autoMs={AUTO_MS}>
      {images.map((image) => (
        <div key={image.src} className="rail-slot shrink-0 snap-start px-2">
        <figure className="rail-card relative aspect-video w-[78vw] overflow-hidden bg-stage sm:w-112 lg:w-136">
          <ViewerTrigger itemKey={image.src} fill>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 544px, (min-width: 640px) 448px, 78vw"
              className="object-cover"
            />
          </ViewerTrigger>
          {image.caption ? (
            <figcaption className="label pointer-events-none absolute inset-x-0 bottom-0 bg-stage px-4 py-2 text-stage-ink">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
        </div>
      ))}
    </SlideRow>
  );
}
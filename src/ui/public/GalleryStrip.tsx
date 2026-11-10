import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { SlideRow } from "@/ui/public/SlideRow";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";

type Props = {
  images: ImageView[];
};

/** Section 3: the photo collection as a sliding row. A click opens the image viewer. */
export function GalleryStrip({ images }: Props) {
  return (
    <SlideRow>
      {images.map((image) => (
        <figure
          key={image.src}
          className="rail-card relative aspect-4/3 w-[80vw] shrink-0 snap-start overflow-hidden bg-stage sm:w-112"
        >
          <ViewerTrigger itemKey={image.src} fill>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 448px, 80vw"
              className="object-cover"
            />
          </ViewerTrigger>
          {image.caption ? (
            <figcaption className="label pointer-events-none absolute inset-x-0 bottom-0 bg-stage px-4 py-2 text-stage-ink">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </SlideRow>
  );
}
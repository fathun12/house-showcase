import Image from "next/image";
import type { ImageView } from "@/features/houses/view";
import { Rail } from "@/ui/public/Rail";
import { ViewerTrigger } from "@/ui/public/ViewerTrigger";

type Props = {
  images: ImageView[];
};

/** The photo collection as a sliding row. A click opens the image viewer. */
export function GalleryStrip({ images }: Props) {
  return (
    <Rail>
      {images.map((image) => (
        <figure key={image.src} className="rail-card relative w-72 shrink-0 snap-start sm:w-96">
          <div className="relative aspect-4/3 overflow-hidden border-2 border-foreground">
            <ViewerTrigger itemKey={image.src} fill>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 384px, 288px"
                className="object-cover"
              />
            </ViewerTrigger>
          </div>
          {image.caption ? (
            <figcaption className="label mt-2 text-muted">{image.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </Rail>
  );
}
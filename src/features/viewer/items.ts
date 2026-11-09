import type { HouseContent, ImageView, RoomView } from "@/features/houses/view";

/** The few room fields the info panel needs (no photos, so nothing is sent twice) */
export type ViewerRoom = Pick<
  RoomView,
  "number" | "name" | "floor" | "description" | "rationale"
>;

export type ViewerItem = {
  /** Same as image.src, which is unique per picture */
  key: string;
  kind: "hero" | "floorplan" | "room" | "gallery";
  image: ImageView;
  room: ViewerRoom | null;
};

/** A room the floor plan panel can jump to: its first photo */
export type ViewerJump = { key: string; number: string; name: string };

function toItem(
  kind: ViewerItem["kind"],
  image: ImageView,
  room: RoomView | null = null,
): ViewerItem {
  return {
    key: image.src,
    kind,
    image,
    room: room
      ? {
          number: room.number,
          name: room.name,
          floor: room.floor,
          description: room.description,
          rationale: room.rationale,
        }
      : null,
  };
}

/** Every picture of the page, in the order the page shows them. */
export function buildViewerItems(content: HouseContent): ViewerItem[] {
  return [
    ...(content.hero ? [toItem("hero", content.hero)] : []),
    ...content.floorplans.map((image) => toItem("floorplan", image)),
    ...content.rooms.flatMap((room) =>
      room.photos.map((image) => toItem("room", image, room)),
    ),
    ...content.gallery.map((image) => toItem("gallery", image)),
  ];
}

/** One entry per room that has photos. */
export function buildJumps(items: ViewerItem[]): ViewerJump[] {
  const jumps: ViewerJump[] = [];

  for (const item of items) {
    const room = item.room;
    if (!room || jumps.some((jump) => jump.number === room.number)) continue;
    jumps.push({ key: item.key, number: room.number, name: room.name });
  }

  return jumps;
}
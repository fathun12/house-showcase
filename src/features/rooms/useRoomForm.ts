"use client";

import { useActionState } from "react";
import type { Room } from "@/types/house";
import { saveRoom, type RoomFormState } from "./actions";
import type { RoomFormValues } from "./schema";

const initialState: RoomFormState = {
  status: "idle",
  fieldErrors: {},
  values: null,
};

function roomToFormValues(room: Room | null): RoomFormValues {
  return {
    position: room?.position?.toString() ?? "0",
    floor: room?.floor?.toString() ?? "",
    name_id: room?.name_id ?? "",
    name_en: room?.name_en ?? "",
    description_id: room?.description_id ?? "",
    description_en: room?.description_en ?? "",
    rationale_id: room?.rationale_id ?? "",
    rationale_en: room?.rationale_en ?? "",
  };
}

export function useRoomForm(houseId: string, room: Room | null) {
  const [state, formAction, isPending] = useActionState(
    saveRoom.bind(null, houseId, room?.id ?? null),
    initialState,
  );

  // After a failed save, keep what the admin typed instead of resetting the form
  const values = state.values ?? roomToFormValues(room);

  return { values, errors: state.fieldErrors, formAction, isPending };
}
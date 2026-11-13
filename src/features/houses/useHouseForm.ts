"use client";

import { useActionState } from "react";
import type { House, HouseKind } from "@/types/house";
import { saveHouse, type HouseFormState } from "./actions";
import type { HouseFormValues } from "./schema";

const initialState: HouseFormState = {
  status: "idle",
  fieldErrors: {},
  values: null,
};

function houseToFormValues(house: House | null, kind: HouseKind): HouseFormValues {
  return {
    kind: house?.kind ?? kind,
    slug: house?.slug ?? "",
    title_id: house?.title_id ?? "",
    title_en: house?.title_en ?? "",
    tagline_id: house?.tagline_id ?? "",
    tagline_en: house?.tagline_en ?? "",
    why_id: house?.why_id ?? "",
    why_en: house?.why_en ?? "",
    notes_id: house?.notes_id ?? "",
    notes_en: house?.notes_en ?? "",
    floors: house?.floors?.toString() ?? "",
    bedrooms: house?.bedrooms?.toString() ?? "",
    bathrooms: house?.bathrooms?.toString() ?? "",
    area_m2: house?.area_m2?.toString() ?? "",
    length_cm: house?.length_cm?.toString() ?? "",
    width_cm: house?.width_cm?.toString() ?? "",
    height_cm: house?.height_cm?.toString() ?? "",
    material_id: house?.material_id ?? "",
    material_en: house?.material_en ?? "",
    finish_id: house?.finish_id ?? "",
    finish_en: house?.finish_en ?? "",
    designer: house?.designer ?? "",
    whatsapp: house?.whatsapp ?? "",
    sort_order: house?.sort_order?.toString() ?? "0",
    is_published: house?.is_published ? "on" : "",
  };
}

export function useHouseForm(house: House | null, kind: HouseKind) {
  const [state, formAction, isPending] = useActionState(
    saveHouse.bind(null, house?.id ?? null),
    initialState,
  );

  // After a failed save, keep what the admin typed instead of resetting the form
  const values = state.values ?? houseToFormValues(house, kind);

  return { values, errors: state.fieldErrors, formAction, isPending };
}
import { createContext, useContext } from "react";

type OpenViewer = (key: string) => void;

export const ViewerContext = createContext<OpenViewer | null>(null);

/** Returns a function that opens the viewer at a picture; does nothing outside a viewer. */
export function useOpenViewer(): OpenViewer {
  return useContext(ViewerContext) ?? (() => {});
}
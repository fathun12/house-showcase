"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ModelView } from "@/features/furniture/view";

function Placeholder() {
  const t = useTranslations("public.furniture.model");

  return (
    <div className="grid h-[70dvh] min-h-96 place-items-center bg-stage text-stage-ink lg:h-[78dvh]">
      <p className="label">{t("loading")}</p>
    </div>
  );
}

// Three.js is only downloaded on furniture pages, and only in the browser
const ModelViewer = dynamic(
  () => import("@/ui/public/ModelViewer").then((module) => module.ModelViewer),
  { ssr: false, loading: () => <Placeholder /> },
);

export function ModelSection({ models }: { models: ModelView[] }) {
  return <ModelViewer models={models} />;
}
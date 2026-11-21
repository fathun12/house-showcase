"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRedeem } from "@/features/files/useRedeem";
import type { FileView } from "@/features/houses/view";
import { Button } from "@/ui/primitives/Button";

/** Downloadable files. Clicking one asks for a one-time token from the admin. */
export function FileDownloads({ files }: { files: FileView[] }) {
  const t = useTranslations("public.files");
  const { state, pending, redeem, reset } = useRedeem();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<FileView | null>(null);
  const [token, setToken] = useState("");
  const titleId = useId();
  const inputId = useId();

  function open(file: FileView) {
    reset();
    setToken("");
    setSelected(file);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (selected && token.trim()) redeem(selected.id, token);
  }

  return (
    <div>
      <p className="label text-accent">{t("title")}</p>

      <ul className="mt-3 border-t-2 border-foreground">
        {files.map((file) => (
          <li key={file.id} className="border-b border-foreground">
            <button
              type="button"
              onClick={() => open(file)}
              className="label flex min-h-11 w-full items-center gap-3 py-2 text-left hover:text-accent focus-visible:-outline-offset-2"
            >
              <span className="text-accent">{file.ext}</span>
              <span className="min-w-0 flex-1 break-words">{file.name}</span>
              <span className="text-muted">{file.size}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="label mt-3 text-muted">{t("hint")}</p>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setSelected(null)}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] border-2 border-foreground bg-background p-6 text-foreground backdrop:bg-black/60"
      >
        {selected ? (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <p className="label text-accent">{t("dialogTitle")}</p>
              <h2 id={titleId} className="mt-2 text-xl font-semibold break-words">
                {selected.name}
              </h2>
            </div>

            <p className="text-sm text-muted">{t("dialogHint")}</p>

            <div className="flex flex-col gap-2">
              <label htmlFor={inputId} className="label text-muted">
                {t("tokenLabel")}
              </label>
              <input
                id={inputId}
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                disabled={pending || state === "started"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full border-0 border-b-2 border-foreground bg-transparent py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>

            {state === "invalid" ? (
              <p role="alert" className="label text-accent">
                {t("invalid")}
              </p>
            ) : null}

            {state === "started" ? (
              <p aria-live="polite" className="label">
                {t("started")}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {state === "started" ? (
                <Button type="button" onClick={close}>
                  {t("close")}
                </Button>
              ) : (
                <>
                  <Button type="submit" busy={pending} disabled={token.trim().length === 0}>
                    {pending ? t("checking") : t("submit")}
                  </Button>
                  <Button type="button" variant="outline" onClick={close}>
                    {t("cancel")}
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
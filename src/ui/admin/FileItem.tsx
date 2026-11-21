"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { createFileToken, deleteFile, revokeFileToken } from "@/features/files/actions";
import { formatSize } from "@/features/files/size";
import type { AdminFile } from "@/types/file";
import { Button } from "@/ui/primitives/Button";
import { ProgressBar } from "@/ui/primitives/ProgressBar";

const DAY_OPTIONS = [1, 3, 7, 14, 30] as const;

const field =
  "label border-0 border-b-2 border-foreground bg-transparent py-2 focus:border-accent focus:outline-none";

export function FileItem({ file, number }: { file: AdminFile; number: string }) {
  const t = useTranslations("admin.files.item");
  const noteId = useId();
  const daysId = useId();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("7");
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenFailed, setTokenFailed] = useState(false);
  const [, startDelete] = useTransition();
  const [creating, startCreate] = useTransition();
  const [, startRevoke] = useTransition();

  function remove() {
    setConfirming(false);
    setFailed(false);
    setDeleting(true);

    startDelete(async () => {
      try {
        await deleteFile(file.id);
      } catch {
        setDeleting(false);
        setFailed(true);
      }
    });
  }

  function create() {
    setTokenFailed(false);
    setIssued(null);
    setCopied(false);

    startCreate(async () => {
      try {
        const result = await createFileToken({ fileId: file.id, label, days: Number(days) });

        if (result.ok) {
          setIssued(result.token);
          setLabel("");
        } else {
          setTokenFailed(true);
        }
      } catch {
        setTokenFailed(true);
      }
    });
  }

  function revoke(tokenId: string) {
    startRevoke(async () => {
      try {
        await revokeFileToken(tokenId);
      } catch {
        setTokenFailed(true);
      }
    });
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      // The token is on screen: it can be selected and copied by hand
    }
  }

  if (deleting) {
    return (
      <div className="border-b-2 border-foreground py-4">
        <p aria-live="polite" className="label text-muted">
          <span className="text-accent">{number}</span> / {t("deleting")}
        </p>
        <ProgressBar value={null} label={t("deleting")} className="mt-3 w-full" />
      </div>
    );
  }

  return (
    <div className="border-b-2 border-foreground py-6">
      <div className="flex flex-wrap items-center gap-4">
        <p className="label text-accent">{number}</p>
        <p className="label min-w-0 break-all">{file.file_name}</p>
        <p className="label text-muted">
          {t("size")}: {formatSize(file.size_bytes) || "?"}
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <span className="label">{t("deleteConfirm")}</span>
              <Button type="button" onClick={remove}>
                {t("deleteYes")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
                {t("cancel")}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
              {t("delete")}
            </Button>
          )}
        </div>
      </div>

      {failed ? (
        <p role="alert" className="label mt-3 text-accent">
          {t("deleteFailed")}
        </p>
      ) : null}

      <div className="mt-6">
        <p className="label text-accent">{t("tokens")}</p>

        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <label htmlFor={noteId} className="label text-muted">
              {t("tokenNote")}
            </label>
            <input
              id={noteId}
              type="text"
              maxLength={80}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className={field}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={daysId} className="label text-muted">
              {t("tokenDays")}
            </label>
            <select
              id={daysId}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className={field}
            >
              {DAY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t("days", { count: option })}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" onClick={create} busy={creating}>
            {creating ? t("creating") : t("create")}
          </Button>
        </div>

        {tokenFailed ? (
          <p role="alert" className="label mt-3 text-accent">
            {t("createFailed")}
          </p>
        ) : null}

        {issued ? (
          <div className="mt-4 border-2 border-accent p-4">
            <p className="label text-accent">{t("issued")}</p>
            <code className="mt-3 block font-mono text-sm break-all select-all">{issued}</code>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={() => copy(issued)}>
                {copied ? t("copied") : t("copy")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIssued(null)}>
                {t("dismiss")}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          {file.tokens.length === 0 ? (
            <p className="label text-muted">{t("noTokens")}</p>
          ) : (
            <ul className="border-t border-foreground">
              {file.tokens.map((token) => (
                <li
                  key={token.id}
                  className="flex flex-wrap items-center gap-3 border-b border-foreground py-2"
                >
                  <span
                    className={`label ${token.status === "active" ? "text-accent" : "text-muted"}`}
                  >
                    {t(`status.${token.status}`)}
                  </span>
                  <span className="label">{token.label || "-"}</span>
                  <span className="label text-muted">
                    {t("until")} {token.expires_at.slice(0, 10)}
                  </span>
                  {token.status === "active" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => revoke(token.id)}
                      className="ml-auto"
                    >
                      {t("revoke")}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
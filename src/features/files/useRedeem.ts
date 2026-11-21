"use client";

import { useState, useTransition } from "react";
import { redeemFileToken } from "./redeem";

export type RedeemState = "idle" | "invalid" | "started";

export function useRedeem() {
  const [state, setState] = useState<RedeemState>("idle");
  const [pending, startTransition] = useTransition();

  function reset() {
    setState("idle");
  }

  function redeem(fileId: string, token: string) {
    setState("idle");

    startTransition(async () => {
      try {
        const result = await redeemFileToken({ fileId, token });

        if (result.ok) {
          setState("started");
          window.location.assign(result.url);
        } else {
          setState("invalid");
        }
      } catch {
        setState("invalid");
      }
    });
  }

  return { state, pending, redeem, reset };
}
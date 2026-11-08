"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null, email: "" };

export function useLoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return {
    error: state.error,
    email: state.email,
    formAction,
    isPending,
  };
}
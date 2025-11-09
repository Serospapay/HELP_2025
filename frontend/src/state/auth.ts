"use client";

import { atom } from "jotai";
import { authStatusAtom, currentUserAtom, tokensAtom } from "@/lib/auth";
import { login, register } from "@/lib/endpoints";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone_number?: string;
}

export const loginAtom = atom(null, async (_get, set, payload: LoginInput) => {
  set(authStatusAtom, "loading");
  try {
    const response = await login(payload);
    set(tokensAtom, { access: response.access, refresh: response.refresh });
    set(currentUserAtom, response.user);
    set(authStatusAtom, "authenticated");
  } catch (error) {
    set(authStatusAtom, "guest");
    throw error;
  }
});

export const registerAtom = atom(
  null,
  async (_get, set, payload: RegisterInput) => {
    set(authStatusAtom, "loading");
    try {
      const response = await register(payload);
      set(tokensAtom, response.tokens);
      set(currentUserAtom, response.user);
      set(authStatusAtom, "authenticated");
    } catch (error) {
      set(authStatusAtom, "guest");
      throw error;
    }
  },
);


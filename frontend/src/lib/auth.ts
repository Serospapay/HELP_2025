import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getMe } from "@/lib/endpoints";
import type { Tokens, User } from "@/types";

export const tokensAtom = atomWithStorage<Tokens | null>("auth-tokens", null);

export const currentUserAtom = atom<User | null>(null);

export const authStatusAtom = atom<"idle" | "loading" | "authenticated" | "guest">(
  "idle",
);

export const bootstrapAuthAtom = atom(
  null,
  async (get, set, _arg: void | undefined) => {
    const tokens = get(tokensAtom);
    if (!tokens?.access) {
      set(authStatusAtom, "guest");
      set(currentUserAtom, null);
      return;
    }
    set(authStatusAtom, "loading");
    try {
      const user = await getMe(tokens.access);
      set(currentUserAtom, user);
      set(authStatusAtom, "authenticated");
    } catch (error) {
      console.warn("Auth bootstrap failed", error);
      set(tokensAtom, null);
      set(currentUserAtom, null);
      set(authStatusAtom, "guest");
    }
  },
);

export const logoutAtom = atom(null, (_get, set) => {
  set(tokensAtom, null);
  set(currentUserAtom, null);
  set(authStatusAtom, "guest");
});



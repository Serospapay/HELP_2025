/**
 * @file: useRoles.ts
 * @description: Централізовані хуки для перевірки ролей та прав доступу.
 */

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/lib/auth";
import type { UserRole } from "@/constants/roles";

export function useCurrentUser() {
  return useAtomValue(currentUserAtom);
}

/** Чи користувач має права координатора або адміна (може керувати кампаніями) */
export function useIsCoordinatorOrAdmin(): boolean {
  const user = useCurrentUser();
  return useMemo(() => {
    if (!user) return false;
    return user.role === "coordinator" || user.role === "admin" || Boolean(user.is_staff);
  }, [user]);
}

/** Чи може редагувати кампанію (етапи, зміни) — координатор власної або адмін */
export function useCanEditCampaign(coordinatorId: number | undefined | null): boolean {
  const user = useCurrentUser();
  return useMemo(() => {
    if (!user) return false;
    if (user.role === "admin" || user.is_staff) return true;
    return user.id === coordinatorId;
  }, [user, coordinatorId]);
}

/** Чи є адміном (роль або is_staff) */
export function useIsAdmin(): boolean {
  const user = useCurrentUser();
  return useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || Boolean(user.is_staff);
  }, [user]);
}

/** Парсинг ролі для UI (fallback на volunteer) */
export function useSafeRole(): UserRole {
  const user = useCurrentUser();
  const validRoles: UserRole[] = ["volunteer", "coordinator", "beneficiary", "admin"];
  return useMemo(() => {
    if (!user?.role || !validRoles.includes(user.role as UserRole))
      return "volunteer";
    return user.role as UserRole;
  }, [user]);
}

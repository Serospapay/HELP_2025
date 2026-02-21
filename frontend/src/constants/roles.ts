export const UserRoleLabels: Record<string, string> = {
  volunteer: "Волонтер",
  coordinator: "Координатор",
  beneficiary: "Отримувач допомоги",
  admin: "Адміністратор",
};

export type UserRole = "volunteer" | "coordinator" | "beneficiary" | "admin";

/** Ролі, дозволені при самореєстрації (admin тільки через Django admin) */
export const REGISTRABLE_ROLES: UserRole[] = [
  "volunteer",
  "coordinator",
  "beneficiary",
];

export const USER_ROLES: UserRole[] = [
  ...REGISTRABLE_ROLES,
  "admin",
];

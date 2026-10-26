
export const ROLES = ["ADMIN", "OWNER"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = "OWNER";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}


export function getRole(user: { role?: unknown } | null | undefined): Role {
  return isRole(user?.role) ? user.role : DEFAULT_ROLE;
}

export function isAdmin(user: { role?: unknown } | null | undefined): boolean {
  return getRole(user) === "ADMIN";
}

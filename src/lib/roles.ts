/**
 * The platform has exactly two roles (PRD section 2).
 * - OWNER  : every person who signs up. Owns their own forms and responses.
 * - ADMIN  : platform operator. Created only by scripts/make-admin.ts, never
 *            through the UI or the API. An admin still only sees their OWN
 *            forms and responses - an admin is not a super-reader.
 */
export const ROLES = ["ADMIN", "OWNER"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = "OWNER";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * Reads the role off a session user. Anything unexpected (missing field, a
 * value written by hand in the database) is treated as the least privileged
 * role, so a broken row can never accidentally grant admin rights.
 */
export function getRole(user: { role?: unknown } | null | undefined): Role {
  return isRole(user?.role) ? user.role : DEFAULT_ROLE;
}

export function isAdmin(user: { role?: unknown } | null | undefined): boolean {
  return getRole(user) === "ADMIN";
}

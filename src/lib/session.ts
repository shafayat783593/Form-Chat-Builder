import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { AppError } from "./errors";
import { getRole, type Role } from "./roles";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new AppError(401, "Unauthorized");
  return session.user;
}

export async function requireUserPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

/**
 * Service-layer guard for anything an admin may do (templates, ...).
 * Throws a 403 AppError, which server actions turn into a failed ActionResult
 * and route handlers into a 403 response.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (getRole(user) !== "ADMIN") throw new AppError(403, "Forbidden");
  return user;
}

/**
 * Page guard for /admin/*. A signed-in non-admin gets the not-found page
 * (404, not 403) so the existence of the admin area is not disclosed.
 * An anonymous visitor is redirected to /login by requireUserPage().
 */
export async function requireAdminPage() {
  const user = await requireUserPage();
  if (getRole(user) !== "ADMIN") notFound();
  return user;
}

export function roleOf(user: { role?: unknown } | null | undefined): Role {
  return getRole(user);
}

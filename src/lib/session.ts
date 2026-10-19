import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { AppError } from "./errors";

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
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generates an 8-char base64url form slug (PRD section 6.1 step 4).
 * Retries on unique collision, up to 3 attempts.
 */
export async function generateFormSlug(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomBytes(6).toString("base64url");
    const existing = await prisma.form.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    lastError = new Error("slug collision");
  }
  throw lastError ?? new Error("Unable to generate a unique form slug. Try again.");
}

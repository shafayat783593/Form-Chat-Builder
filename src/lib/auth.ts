import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { DEFAULT_ROLE } from "./roles";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    additionalFields: {
      // `input: false` means the field can never be supplied by the client
      // (sign-up / update). The database default (OWNER) is the only way in;
      // an admin is promoted with scripts/make-admin.ts.
      role: { type: "string", defaultValue: DEFAULT_ROLE, input: false },
    },
  },
  plugins: [nextCookies()],
});

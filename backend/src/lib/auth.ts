import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../config/db.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    emailAndPassword: {
        enabled: true,
    },
    // Cast to any to avoid strict type issues when providers are optional
    socialProviders: {
        github:
            env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
                ? {
                      clientId: env.GITHUB_CLIENT_ID,
                      clientSecret: env.GITHUB_CLIENT_SECRET,
                  }
                : undefined,
        google:
            env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
                ? {
                      clientId: env.GOOGLE_CLIENT_ID,
                      clientSecret: env.GOOGLE_CLIENT_SECRET,
                      prompt: "select_account",
                  }
                : undefined,
    } as any,
    experimental: {
        joins: true,
    },
});

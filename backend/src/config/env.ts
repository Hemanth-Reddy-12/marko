import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.string().default("5000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
    FRONTEND_URL: z.string().default("http://localhost:5173"),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    AI_PROVIDER: z
        .enum(["openai", "gemini", "mock"])
        .default("openai"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    OPENAI_BASE_URL: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    BASE_URL: z.string().default("http://localhost:5000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        "❌ Invalid environment variables:",
        parsed.error.flatten().fieldErrors,
    );
    process.exit(1);
}

export const env = parsed.data;

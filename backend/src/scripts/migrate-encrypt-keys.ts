/**
 * One-time migration script: encrypt any existing plain-text API keys in AiProviderConfig.
 *
 * Run with:
 *   npx tsx src/scripts/migrate-encrypt-keys.ts
 *
 * Safe to run multiple times — it detects already-encrypted values and skips them.
 */
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { encryptKey, isEncrypted } from "../lib/crypto.js";

import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {
    console.log("🔐 Starting API key encryption migration...");

    const configs = await prisma.aiProviderConfig.findMany();

    if (configs.length === 0) {
        console.log("No AiProviderConfig rows found. Nothing to migrate.");
        return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const config of configs) {
        const updates: Record<string, string | null> = {};

        if (config.geminiApiKey && !isEncrypted(config.geminiApiKey)) {
            updates.geminiApiKey = encryptKey(config.geminiApiKey);
        }
        if (config.openaiApiKey && !isEncrypted(config.openaiApiKey)) {
            updates.openaiApiKey = encryptKey(config.openaiApiKey);
        }
        if (config.anthropicApiKey && !isEncrypted(config.anthropicApiKey)) {
            updates.anthropicApiKey = encryptKey(config.anthropicApiKey);
        }

        if (Object.keys(updates).length > 0) {
            await prisma.aiProviderConfig.update({
                where: { id: config.id },
                data: updates,
            });
            console.log(`  ✅ Migrated userId=${config.userId} — fields: ${Object.keys(updates).join(", ")}`);
            migrated++;
        } else {
            console.log(`  ⏭  Skipped userId=${config.userId} (already encrypted or empty)`);
            skipped++;
        }
    }

    console.log(`\nMigration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
}

main()
    .catch((e) => {
        console.error("Migration failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

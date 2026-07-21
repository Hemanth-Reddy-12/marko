import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { env } from "./env.js";

const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 10, // Avoid exceeding Neon connection limits
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Timeout after 5s when connecting
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PG client:", err.message || err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;

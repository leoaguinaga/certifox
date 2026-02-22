import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

function normalizeConnectionString(rawUrl: string) {
    try {
        const url = new URL(rawUrl);
        const sslmode = url.searchParams.get("sslmode");
        const hasLibpqCompat = url.searchParams.has("uselibpqcompat");

        if (sslmode === "require" && !hasLibpqCompat) {
            url.searchParams.set("uselibpqcompat", "true");
        }

        return url.toString();
    } catch {
        return rawUrl;
    }
}

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
    throw new Error("DATABASE_URL no está definida.");
}

const connectionString = normalizeConnectionString(rawConnectionString);

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export { db }

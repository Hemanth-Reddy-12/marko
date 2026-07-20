/**
 * AES-256-GCM encryption for API keys stored in the database.
 * Keys are encrypted before write and decrypted before use in providers.
 *
 * Format stored: "iv:authTag:ciphertext" (all hex-encoded)
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Derives a 32-byte AES key from any string using SHA-256.
 * We use BETTER_AUTH_SECRET so no extra env var is needed.
 */
function deriveKey(secret: string): Buffer {
    return createHash("sha256").update(secret).digest();
}

let _key: Buffer | null = null;

function getKey(): Buffer {
    if (_key) return _key;
    const secret = process.env.ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
    if (!secret) {
        throw new Error(
            "No ENCRYPTION_KEY or BETTER_AUTH_SECRET found. Cannot encrypt/decrypt API keys."
        );
    }
    _key = deriveKey(secret);
    return _key;
}

/**
 * Encrypt a plaintext string.
 * Returns a formatted string: "iv:authTag:ciphertext" (all hex).
 * Returns null if the input is empty or null.
 */
export function encryptKey(plaintext: string | null | undefined): string | null {
    if (!plaintext || plaintext.trim() === "") return null;
    const key = getKey();
    const iv = randomBytes(12); // 96-bit IV for GCM
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt an encrypted string produced by encryptKey().
 * Returns null if the input is null, empty, or not in encrypted format.
 * Handles legacy plain-text keys gracefully (returns them as-is).
 */
export function decryptKey(stored: string | null | undefined): string | null {
    if (!stored || stored.trim() === "") return null;

    // Detect encrypted format: three colon-separated hex segments
    const parts = stored.split(":");
    if (parts.length !== 3) {
        // Legacy plain-text key — return it as-is so old configs still work
        return stored;
    }

    try {
        const key = getKey();
        const iv = Buffer.from(parts[0]!, "hex");
        const authTag = Buffer.from(parts[1]!, "hex");
        const ciphertext = Buffer.from(parts[2]!, "hex");

        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted.toString("utf8");
    } catch {
        // Decryption failed — may be a plain-text key with colons (e.g., a URL was stored)
        // Return raw as fallback rather than breaking the whole system
        return stored;
    }
}

/**
 * Returns true if this string looks like a key encrypted by encryptKey().
 */
export function isEncrypted(value: string | null | undefined): boolean {
    if (!value) return false;
    const parts = value.split(":");
    if (parts.length !== 3) return false;
    return parts.every((p) => /^[0-9a-f]+$/i.test(p));
}

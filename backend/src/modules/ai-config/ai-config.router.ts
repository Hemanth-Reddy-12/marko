import { Router } from "express";
import prisma from "../../config/db.js";
import { authMiddleware } from "../../middleware/auth.js";
import { createProviderInstance } from "../../lib/ai/factory.js";
import { env } from "../../config/env.js";
import { encryptKey, decryptKey } from "../../lib/crypto.js";

const router = Router();

function maskKey(stored?: string | null): string {
    if (!stored || stored.trim() === "") return "";
    // Decrypt to check length, then re-mask — never send plaintext to client
    const plain = decryptKey(stored);
    if (!plain) return "";
    if (plain.length <= 8) return "••••••••";
    return plain.slice(0, 4) + "••••••••" + plain.slice(-4);
}

// GET /api/ai/config — Fetch user's AI config (keys masked)
router.get("/config", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const config = await prisma.aiProviderConfig.findUnique({ where: { userId } });

        const hasGeminiKey = Boolean(config?.geminiApiKey || env.GEMINI_API_KEY);
        const hasOpenAiKey = Boolean(config?.openaiApiKey || env.OPENAI_API_KEY);
        const hasAnthropicKey = Boolean(config?.anthropicApiKey);
        const hasConfiguredKey = hasGeminiKey || hasOpenAiKey || hasAnthropicKey;

        res.json({
            activeProvider: config?.activeProvider || "",
            activeModel: config?.activeModel || "",
            // Keys are masked — frontend uses these for display only, not for re-sending
            geminiApiKey: maskKey(config?.geminiApiKey),
            openaiApiKey: maskKey(config?.openaiApiKey),
            openaiBaseUrl: config?.openaiBaseUrl || "",
            anthropicApiKey: maskKey(config?.anthropicApiKey),
            anthropicBaseUrl: config?.anthropicBaseUrl || "",
            // Flags telling the frontend which provider slots are occupied
            hasGeminiKey: hasGeminiKey,
            hasOpenAiKey: hasOpenAiKey,
            hasAnthropicKey: hasAnthropicKey,
            hasConfiguredKey,
            hasGeminiEnvKey: Boolean(env.GEMINI_API_KEY),
            hasOpenAiEnvKey: Boolean(env.OPENAI_API_KEY),
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to fetch AI configuration" });
    }
});

// PUT /api/ai/config — Update AI config (only writes if key is not masked)
router.put("/config", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const {
            activeProvider,
            activeModel,
            geminiApiKey,
            openaiApiKey,
            openaiBaseUrl,
            anthropicApiKey,
            anthropicBaseUrl,
        } = req.body;

        // Read existing config once to check for existing keys (409 enforcement)
        const existing = await prisma.aiProviderConfig.findUnique({ where: { userId } });

        const updateData: Record<string, any> = {};

        if (activeProvider !== undefined) updateData.activeProvider = activeProvider;
        if (activeModel !== undefined) updateData.activeModel = activeModel;

        // Only overwrite a key field if the incoming value is a real key (not a masked placeholder)
        if (geminiApiKey !== undefined && !geminiApiKey.includes("••••")) {
            if (geminiApiKey.trim()) {
                // Enforce one key per provider: check if one already exists
                if (existing?.geminiApiKey) {
                    res.status(409).json({
                        error: "A Gemini API key is already stored. Delete the existing key first before adding a new one.",
                    });
                    return;
                }
                updateData.geminiApiKey = encryptKey(geminiApiKey.trim());
            }
        }

        if (openaiApiKey !== undefined && !openaiApiKey.includes("••••")) {
            if (openaiApiKey.trim()) {
                if (existing?.openaiApiKey) {
                    res.status(409).json({
                        error: "An OpenAI API key is already stored. Delete the existing key first before adding a new one.",
                    });
                    return;
                }
                updateData.openaiApiKey = encryptKey(openaiApiKey.trim());
            }
        }

        if (openaiBaseUrl !== undefined) {
            updateData.openaiBaseUrl = openaiBaseUrl.trim() || null;
        }

        if (anthropicApiKey !== undefined && !anthropicApiKey.includes("••••")) {
            if (anthropicApiKey.trim()) {
                if (existing?.anthropicApiKey) {
                    res.status(409).json({
                        error: "An Anthropic API key is already stored. Delete the existing key first before adding a new one.",
                    });
                    return;
                }
                updateData.anthropicApiKey = encryptKey(anthropicApiKey.trim());
            }
        }

        if (anthropicBaseUrl !== undefined) {
            updateData.anthropicBaseUrl = anthropicBaseUrl.trim() || null;
        }

        const updated = await prisma.aiProviderConfig.upsert({
            where: { userId },
            create: {
                userId,
                activeProvider: activeProvider || null,
                activeModel: activeModel || null,
                ...updateData,
            },
            update: updateData,
        });

        const hasConfiguredKey = Boolean(
            updated.geminiApiKey || updated.openaiApiKey || updated.anthropicApiKey ||
            env.GEMINI_API_KEY || env.OPENAI_API_KEY
        );

        res.json({
            message: "AI configuration saved successfully",
            activeProvider: updated.activeProvider || "",
            activeModel: updated.activeModel || "",
            geminiApiKey: maskKey(updated.geminiApiKey),
            openaiApiKey: maskKey(updated.openaiApiKey),
            openaiBaseUrl: updated.openaiBaseUrl || "",
            anthropicApiKey: maskKey(updated.anthropicApiKey),
            anthropicBaseUrl: updated.anthropicBaseUrl || "",
            hasGeminiKey: Boolean(updated.geminiApiKey),
            hasOpenAiKey: Boolean(updated.openaiApiKey),
            hasAnthropicKey: Boolean(updated.anthropicApiKey),
            hasConfiguredKey,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to update AI configuration" });
    }
});

// DELETE /api/ai/config/key/:provider — Clear a specific provider's API key
router.delete("/config/key/:provider", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const provider = req.params.provider as string;

        const clearField: Record<string, any> = {};
        if (provider === "gemini") {
            clearField.geminiApiKey = null;
        } else if (provider === "openai") {
            clearField.openaiApiKey = null;
            clearField.openaiBaseUrl = null;
        } else if (provider === "anthropic") {
            clearField.anthropicApiKey = null;
            clearField.anthropicBaseUrl = null;
        } else {
            res.status(400).json({ error: `Unknown provider: ${provider}` });
            return;
        }

        const updated = await prisma.aiProviderConfig.upsert({
            where: { userId },
            create: { userId, ...clearField },
            update: clearField,
        });

        const hasConfiguredKey = Boolean(
            updated.geminiApiKey || updated.openaiApiKey || updated.anthropicApiKey ||
            env.GEMINI_API_KEY || env.OPENAI_API_KEY
        );

        res.json({
            message: `${provider} API key removed successfully`,
            geminiApiKey: maskKey(updated.geminiApiKey),
            openaiApiKey: maskKey(updated.openaiApiKey),
            openaiBaseUrl: updated.openaiBaseUrl || "",
            anthropicApiKey: maskKey(updated.anthropicApiKey),
            anthropicBaseUrl: updated.anthropicBaseUrl || "",
            hasGeminiKey: Boolean(updated.geminiApiKey),
            hasOpenAiKey: Boolean(updated.openaiApiKey),
            hasAnthropicKey: Boolean(updated.anthropicApiKey),
            hasConfiguredKey,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to remove API key" });
    }
});

// GET /api/ai/models — List models for provider (uses stored decrypted key)
router.get("/models", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const requestedProvider = (req.query.provider as string) || "gemini";
        const customBaseUrl = req.query.baseURL as string | undefined;
        const customApiKey = req.query.apiKey as string | undefined;

        const config = await prisma.aiProviderConfig.findUnique({ where: { userId } });

        let apiKey = customApiKey;
        let baseURL = customBaseUrl;

        if (!apiKey && config) {
            if (requestedProvider === "gemini") apiKey = decryptKey(config.geminiApiKey) || undefined;
            if (requestedProvider === "openai") apiKey = decryptKey(config.openaiApiKey) || undefined;
            if (requestedProvider === "anthropic") apiKey = decryptKey(config.anthropicApiKey) || undefined;
        }

        // Fallback to env keys
        if (!apiKey) {
            if (requestedProvider === "gemini") apiKey = env.GEMINI_API_KEY;
            if (requestedProvider === "openai") apiKey = env.OPENAI_API_KEY;
        }

        if (!baseURL && config) {
            if (requestedProvider === "openai") baseURL = config.openaiBaseUrl || undefined;
            if (requestedProvider === "anthropic") baseURL = config.anthropicBaseUrl || undefined;
        }

        if (!baseURL) {
            if (requestedProvider === "openai") baseURL = env.OPENAI_BASE_URL;
        }

        const providerOpts: { apiKey?: string; baseURL?: string } = {};
        if (apiKey) providerOpts.apiKey = apiKey;
        if (baseURL) providerOpts.baseURL = baseURL;
        const provider = createProviderInstance(requestedProvider, providerOpts);

        let models: string[] = [];
        if ("listModels" in provider && typeof (provider as any).listModels === "function") {
            models = await (provider as any).listModels();
        }

        res.json({ provider: requestedProvider, models });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to list models" });
    }
});

// POST /api/ai/test-connection — Test AI provider connection
router.post("/test-connection", authMiddleware, async (req: any, res) => {
    try {
        const { provider, apiKey, baseURL, model } = req.body;
        const userId = req.user.id;

        const config = await prisma.aiProviderConfig.findUnique({ where: { userId } });

        let effectiveKey = apiKey;
        // If masked key sent, load from DB (decrypted)
        if (effectiveKey && effectiveKey.includes("••••") && config) {
            if (provider === "gemini") effectiveKey = decryptKey(config.geminiApiKey) || env.GEMINI_API_KEY;
            if (provider === "openai") effectiveKey = decryptKey(config.openaiApiKey) || env.OPENAI_API_KEY;
            if (provider === "anthropic") effectiveKey = decryptKey(config.anthropicApiKey) || undefined;
        }

        let effectiveBaseUrl = baseURL;
        if (!effectiveBaseUrl && config) {
            if (provider === "openai") effectiveBaseUrl = config.openaiBaseUrl || env.OPENAI_BASE_URL;
            if (provider === "anthropic") effectiveBaseUrl = config.anthropicBaseUrl || undefined;
        }

        if (!effectiveKey && provider !== "mock") {
            res.status(400).json({
                success: false,
                error: `No API key found for ${provider}. Please add an API key in Settings → AI Providers.`,
            });
            return;
        }

        const instance = createProviderInstance(provider, {
            apiKey: effectiveKey,
            baseURL: effectiveBaseUrl,
            model,
        });

        const testResult = await instance.generateStructured(
            { messages: [{ role: "user", content: "Respond with ok: true" }], model },
            { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"] },
            "TestConnection"
        );

        res.json({
            success: true,
            message: `Connected to ${provider} successfully.`,
            provider: instance.info.name,
            model: instance.info.model,
            response: testResult,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message || "Connection test failed" });
    }
});

export default router;

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
        const config = await prisma.aiProviderConfig.findUnique({
            where: { userId },
        });

        const hasGeminiKey = Boolean(
            config?.geminiApiKey || env.GEMINI_API_KEY,
        );
        const hasOpenAiKey = Boolean(
            config?.openaiApiKey || env.OPENAI_API_KEY,
        );
        const hasAnthropicKey = Boolean(config?.anthropicApiKey);
        const hasConfiguredKey =
            hasGeminiKey || hasOpenAiKey || hasAnthropicKey;

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
        res.status(500).json({
            error: err.message || "Failed to fetch AI configuration",
        });
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
        const existing = await prisma.aiProviderConfig.findUnique({
            where: { userId },
        });

        const updateData: Record<string, any> = {};

        if (activeProvider !== undefined)
            updateData.activeProvider = activeProvider;
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

        if (
            anthropicApiKey !== undefined &&
            !anthropicApiKey.includes("••••")
        ) {
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
            updated.geminiApiKey ||
            updated.openaiApiKey ||
            updated.anthropicApiKey ||
            env.GEMINI_API_KEY ||
            env.OPENAI_API_KEY,
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
        res.status(500).json({
            error: err.message || "Failed to update AI configuration",
        });
    }
});

// DELETE /api/ai/config/key/:provider — Clear a specific provider's API key
router.delete(
    "/config/key/:provider",
    authMiddleware,
    async (req: any, res) => {
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
                res.status(400).json({
                    error: `Unknown provider: ${provider}`,
                });
                return;
            }

            const updated = await prisma.aiProviderConfig.upsert({
                where: { userId },
                create: { userId, ...clearField },
                update: clearField,
            });

            const hasConfiguredKey = Boolean(
                updated.geminiApiKey ||
                updated.openaiApiKey ||
                updated.anthropicApiKey ||
                env.GEMINI_API_KEY ||
                env.OPENAI_API_KEY,
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
            res.status(500).json({
                error: err.message || "Failed to remove API key",
            });
        }
    },
);

// GET /api/ai/models — List models for provider (uses stored decrypted key)
router.get("/models", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const requestedProvider = (req.query.provider as string) || "gemini";
        const customBaseUrl = req.query.baseURL as string | undefined;
        const customApiKey = req.query.apiKey as string | undefined;

        const config = await prisma.aiProviderConfig.findUnique({
            where: { userId },
        });

        let apiKey = customApiKey;
        let baseURL = customBaseUrl;

        if (!apiKey && config) {
            if (requestedProvider === "gemini")
                apiKey = decryptKey(config.geminiApiKey) || undefined;
            if (requestedProvider === "openai")
                apiKey = decryptKey(config.openaiApiKey) || undefined;
            if (requestedProvider === "anthropic")
                apiKey = decryptKey(config.anthropicApiKey) || undefined;
        }

        // Fallback to env keys
        if (!apiKey) {
            if (requestedProvider === "gemini") apiKey = env.GEMINI_API_KEY;
            if (requestedProvider === "openai") apiKey = env.OPENAI_API_KEY;
        }

        if (!baseURL && config) {
            if (requestedProvider === "openai")
                baseURL = config.openaiBaseUrl || undefined;
            if (requestedProvider === "anthropic")
                baseURL = config.anthropicBaseUrl || undefined;
        }

        if (!baseURL) {
            if (requestedProvider === "openai") baseURL = env.OPENAI_BASE_URL;
        }

        const providerOpts: { apiKey?: string; baseURL?: string } = {};
        if (apiKey) providerOpts.apiKey = apiKey;
        if (baseURL) providerOpts.baseURL = baseURL;
        const provider = createProviderInstance(
            requestedProvider,
            providerOpts,
        );

        let models: string[] = [];
        if (
            "listModels" in provider &&
            typeof (provider as any).listModels === "function"
        ) {
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

        const config = await prisma.aiProviderConfig.findUnique({
            where: { userId },
        });

        let effectiveKey = apiKey;
        // If masked key sent, load from DB (decrypted)
        if (effectiveKey && effectiveKey.includes("••••") && config) {
            if (provider === "gemini")
                effectiveKey =
                    decryptKey(config.geminiApiKey) || env.GEMINI_API_KEY;
            if (provider === "openai")
                effectiveKey =
                    decryptKey(config.openaiApiKey) || env.OPENAI_API_KEY;
            if (provider === "anthropic")
                effectiveKey = decryptKey(config.anthropicApiKey) || undefined;
        }

        let effectiveBaseUrl = baseURL;
        if (!effectiveBaseUrl && config) {
            if (provider === "openai")
                effectiveBaseUrl = config.openaiBaseUrl || env.OPENAI_BASE_URL;
            if (provider === "anthropic")
                effectiveBaseUrl = config.anthropicBaseUrl || undefined;
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
            {
                messages: [{ role: "user", content: "Respond with ok: true" }],
                model,
            },
            {
                type: "object",
                properties: { ok: { type: "boolean" } },
                required: ["ok"],
            },
            "TestConnection",
        );

        res.json({
            success: true,
            message: `Connected to ${provider} successfully.`,
            provider: instance.info.name,
            model: instance.info.model,
            response: testResult,
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            error: err.message || "Connection test failed",
        });
    }
});

// GET /api/ai/usage — Fetch user's token usage metrics & agent run history
router.get("/usage", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const runs = await prisma.agentRun.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        const totals = await prisma.agentRun.aggregate({
            where: { userId },
            _sum: {
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
            },
            _count: {
                id: true,
            },
        });

        res.json({
            stats: {
                totalTokens: totals._sum.totalTokens || 0,
                promptTokens: totals._sum.promptTokens || 0,
                completionTokens: totals._sum.completionTokens || 0,
                totalRuns: totals._count.id || 0,
            },
            history: runs,
        });
    } catch (err: any) {
        res.status(500).json({
            error: err.message || "Failed to fetch AI token usage",
        });
    }
});

// GET /api/ai/usage/courses — Fetch token usage aggregated course-wise
router.get("/usage/courses", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Fetch user courses
        const courses = await prisma.course.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Fetch all agent runs for this user
        const allRuns = await prisma.agentRun.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        // Gather entity IDs to resolve course mapping
        const lessonIds = allRuns
            .filter((r) => r.entityType === "Lesson")
            .map((r) => r.entityId);
        const quizIds = allRuns
            .filter((r) => r.entityType === "Quiz")
            .map((r) => r.entityId);
        const interviewIds = allRuns
            .filter((r) => r.entityType === "Interview")
            .map((r) => r.entityId);
        const chatSessionIds = allRuns
            .filter((r) => r.entityType === "ChatSession")
            .map((r) => r.entityId);

        const [lessons, quizzes, interviews, chatSessions] = await Promise.all([
            lessonIds.length
                ? prisma.lesson.findMany({
                      where: { id: { in: lessonIds } },
                      select: { id: true, title: true, courseId: true },
                  })
                : [],
            quizIds.length
                ? prisma.quiz.findMany({
                      where: { id: { in: quizIds } },
                      select: {
                          id: true,
                          lesson: { select: { courseId: true, title: true } },
                      },
                  })
                : [],
            interviewIds.length
                ? prisma.interview.findMany({
                      where: { id: { in: interviewIds } },
                      select: { id: true, courseId: true },
                  })
                : [],
            chatSessionIds.length
                ? prisma.chatSession.findMany({
                      where: { id: { in: chatSessionIds } },
                      select: { id: true, courseId: true },
                  })
                : [],
        ]);

        const lessonMap = new Map(lessons.map((l) => [l.id, l]));
        const quizMap = new Map(quizzes.map((q) => [q.id, q]));
        const interviewMap = new Map(interviews.map((i) => [i.id, i]));
        const chatSessionMap = new Map(chatSessions.map((c) => [c.id, c]));

        // Group runs by courseId
        const courseUsageMap = new Map<
            string,
            {
                courseId: string;
                courseTitle: string;
                status: string;
                totalTokens: number;
                promptTokens: number;
                completionTokens: number;
                breakdown: {
                    planner: number;
                    content: number;
                    quiz: number;
                    interview: number;
                    tutor: number;
                };
                runs: any[];
            }
        >();

        // Initialize entries for user courses
        courses.forEach((c) => {
            courseUsageMap.set(c.id, {
                courseId: c.id,
                courseTitle: c.title,
                status: c.status,
                totalTokens: 0,
                promptTokens: 0,
                completionTokens: 0,
                breakdown: {
                    planner: 0,
                    content: 0,
                    quiz: 0,
                    interview: 0,
                    tutor: 0,
                },
                runs: [],
            });
        });

        const unassociatedRuns: any[] = [];

        for (const run of allRuns) {
            let targetCourseId: string | null = null;
            let itemLabel: string = run.entityType;

            if (run.entityType === "Course") {
                targetCourseId = run.entityId;
                itemLabel = "Course Planning & Curriculum";
            } else if (run.entityType === "Lesson") {
                const lesson = lessonMap.get(run.entityId);
                if (lesson) {
                    targetCourseId = lesson.courseId;
                    itemLabel = `Lesson: ${lesson.title}`;
                }
            } else if (run.entityType === "Quiz") {
                const quiz = quizMap.get(run.entityId);
                if (quiz) {
                    targetCourseId = quiz.lesson.courseId;
                    itemLabel = `Quiz: ${quiz.lesson.title}`;
                }
            } else if (run.entityType === "Interview") {
                const interview = interviewMap.get(run.entityId);
                if (interview) {
                    targetCourseId = interview.courseId;
                    itemLabel = "Capstone Oral Interview";
                }
            } else if (run.entityType === "ChatSession") {
                const session = chatSessionMap.get(run.entityId);
                if (session && session.courseId) {
                    targetCourseId = session.courseId;
                    itemLabel = "AI Tutor Discussion";
                }
            }

            const runData = {
                id: run.id,
                agent: run.agent,
                entityType: run.entityType,
                entityId: run.entityId,
                label: itemLabel,
                modelName: run.modelName || "Standard Model",
                status: run.status,
                promptTokens: run.promptTokens || 0,
                completionTokens: run.completionTokens || 0,
                totalTokens: run.totalTokens || 0,
                createdAt: run.createdAt,
            };

            if (targetCourseId && courseUsageMap.has(targetCourseId)) {
                const courseData = courseUsageMap.get(targetCourseId)!;
                courseData.totalTokens += runData.totalTokens;
                courseData.promptTokens += runData.promptTokens;
                courseData.completionTokens += runData.completionTokens;
                courseData.runs.push(runData);

                if (run.agent === "PLANNER")
                    courseData.breakdown.planner += runData.totalTokens;
                else if (run.agent === "CONTENT")
                    courseData.breakdown.content += runData.totalTokens;
                else if (run.agent === "QUIZ")
                    courseData.breakdown.quiz += runData.totalTokens;
                else if (run.agent === "INTERVIEW")
                    courseData.breakdown.interview += runData.totalTokens;
                else if (run.agent === "TUTOR")
                    courseData.breakdown.tutor += runData.totalTokens;
            } else {
                unassociatedRuns.push(runData);
            }
        }

        const courseList = Array.from(courseUsageMap.values());
        const totalTokensAll = allRuns.reduce(
            (acc, r) => acc + (r.totalTokens || 0),
            0,
        );
        const promptTokensAll = allRuns.reduce(
            (acc, r) => acc + (r.promptTokens || 0),
            0,
        );
        const completionTokensAll = allRuns.reduce(
            (acc, r) => acc + (r.completionTokens || 0),
            0,
        );

        res.json({
            overall: {
                totalTokens: totalTokensAll,
                promptTokens: promptTokensAll,
                completionTokens: completionTokensAll,
                totalCourses: courses.length,
                totalRuns: allRuns.length,
            },
            courses: courseList,
            unassociated: {
                totalTokens: unassociatedRuns.reduce(
                    (acc, r) => acc + (r.totalTokens || 0),
                    0,
                ),
                runs: unassociatedRuns,
            },
        });
    } catch (err: any) {
        res.status(500).json({
            error: err.message || "Failed to fetch course-wise AI token usage",
        });
    }
});

// GET /api/ai/usage/courses/:courseId — Detailed AI analytics for a specific course
router.get("/usage/courses/:courseId", authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const course = await prisma.course.findFirst({
            where: { id: courseId, userId },
            include: {
                lessons: { select: { id: true, title: true } },
                interview: { select: { id: true } },
                chatSessions: { select: { id: true } },
            },
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        const lessonIds = course.lessons.map((l) => l.id);
        const quizIds = (
            await prisma.quiz.findMany({
                where: { lessonId: { in: lessonIds } },
                select: { id: true },
            })
        ).map((q) => q.id);
        const interviewId = course.interview?.id;
        const chatSessionIds = course.chatSessions.map((c) => c.id);

        const lessonTitleMap = new Map(course.lessons.map((l) => [l.id, l.title]));

        // Query agent runs matching course or sub-entities
        const runs = await prisma.agentRun.findMany({
            where: {
                userId,
                OR: [
                    { entityType: "Course", entityId: course.id },
                    { entityType: "Lesson", entityId: { in: lessonIds } },
                    { entityType: "Quiz", entityId: { in: quizIds } },
                    ...(interviewId ? [{ entityType: "Interview", entityId: interviewId }] : []),
                    { entityType: "ChatSession", entityId: { in: chatSessionIds } },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        let totalTokens = 0;
        let promptTokens = 0;
        let completionTokens = 0;

        const activityBreakdown = { planner: 0, content: 0, quiz: 0, interview: 0, tutor: 0 };
        const modelBreakdownMap = new Map<string, { model: string; tokens: number; count: number }>();
        const timelineMap = new Map<string, { date: string; tokens: number; promptTokens: number; completionTokens: number }>();

        const formattedRuns = runs.map((run) => {
            const p = run.promptTokens || 0;
            const c = run.completionTokens || 0;
            const t = run.totalTokens || p + c;
            const modelName = run.modelName || "Standard Model";

            totalTokens += t;
            promptTokens += p;
            completionTokens += c;

            // Activity breakdown
            if (run.agent === "PLANNER") activityBreakdown.planner += t;
            else if (run.agent === "CONTENT") activityBreakdown.content += t;
            else if (run.agent === "QUIZ") activityBreakdown.quiz += t;
            else if (run.agent === "INTERVIEW") activityBreakdown.interview += t;
            else if (run.agent === "TUTOR") activityBreakdown.tutor += t;

            // Model breakdown
            const existingModel = modelBreakdownMap.get(modelName) || { model: modelName, tokens: 0, count: 0 };
            existingModel.tokens += t;
            existingModel.count += 1;
            modelBreakdownMap.set(modelName, existingModel);

            // Timeline breakdown (by date YYYY-MM-DD)
            const dateStr = new Date(run.createdAt).toISOString().split("T")[0] || "Unknown Date";
            const existingTimeline = timelineMap.get(dateStr) || { date: dateStr, tokens: 0, promptTokens: 0, completionTokens: 0 };
            existingTimeline.tokens += t;
            existingTimeline.promptTokens += p;
            existingTimeline.completionTokens += c;
            timelineMap.set(dateStr, existingTimeline);

            let label = run.entityType;
            if (run.entityType === "Course") label = "Course Planning & Syllabus";
            else if (run.entityType === "Lesson") label = `Lesson: ${lessonTitleMap.get(run.entityId) || "Content"}`;
            else if (run.entityType === "Quiz") label = "Quiz Assessment";
            else if (run.entityType === "Interview") label = "Capstone Oral Exam";
            else if (run.entityType === "ChatSession") label = "AI Tutor Discussion";

            return {
                id: run.id,
                agent: run.agent,
                entityType: run.entityType,
                entityId: run.entityId,
                label,
                modelName,
                status: run.status,
                promptTokens: p,
                completionTokens: c,
                totalTokens: t,
                createdAt: run.createdAt,
            };
        });

        // Timeline sorted chronologically
        const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const modelBreakdown = Array.from(modelBreakdownMap.values());

        res.json({
            course: {
                id: course.id,
                title: course.title,
                status: course.status,
            },
            summary: {
                totalTokens,
                promptTokens,
                completionTokens,
                totalRuns: runs.length,
                modelsUsedCount: modelBreakdown.length,
            },
            activityBreakdown,
            modelBreakdown,
            timeline,
            runs: formattedRuns,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to fetch detailed course AI analytics" });
    }
});

export default router;

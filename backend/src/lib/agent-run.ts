import prisma from "../config/db.js";
import { getChatProvider } from "./ai/index.js";
import type { ChatRequest } from "./ai/types.js";
import { AgentType, AgentRunStatus } from "../generated/prisma/index.js";

interface AgentRunContext {
    agent: AgentType;
    entityType: string;
    entityId: string;
    userId?: string;
    promptVersion: string;
}

export async function runAgent<T>(
    context: AgentRunContext,
    req: ChatRequest,
    schema: any,
    schemaName = "output"
): Promise<T> {
    const provider = await getChatProvider(context.userId);
    
    // Find attempt number
    const prevRuns = await prisma.agentRun.count({
        where: {
            entityType: context.entityType,
            entityId: context.entityId,
            agent: context.agent,
        }
    });

    const attempt = prevRuns + 1;

    // Create RUNNING state
    const run = await prisma.agentRun.create({
        data: {
            agent: context.agent,
            entityType: context.entityType,
            entityId: context.entityId,
            ...(context.userId ? { userId: context.userId } : {}),
            attempt,
            status: AgentRunStatus.RUNNING,
            promptVersion: context.promptVersion,
            input: JSON.parse(JSON.stringify(req)),
            startedAt: new Date(),
        }
    });

    try {
        console.log(`\n[AI] 🚀 Triggering Agent: ${context.agent}`);
        console.log(`[AI] Provider: ${provider.info.name} | Model: ${provider.info.model}`);
        console.log(`[AI] Checking responsiveness... Waiting for response...`);
        const startTime = Date.now();

        const result = await provider.generateStructured<T>(req, schema, schemaName);

        const endTime = Date.now();
        console.log(`[AI] ✅ Success! Response received in ${((endTime - startTime) / 1000).toFixed(2)}s`);

        // Update SUCCESS state
        await prisma.agentRun.update({
            where: { id: run.id },
            data: {
                status: AgentRunStatus.SUCCESS,
                output: JSON.parse(JSON.stringify(result)),
                finishedAt: new Date(),
            }
        });

        return result;
    } catch (error) {
        console.error(`[AI] ❌ Request failed! Error:`, error);
        // Update FAILED state
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await prisma.agentRun.update({
            where: { id: run.id },
            data: {
                status: AgentRunStatus.FAILED,
                error: errorMessage,
                finishedAt: new Date(),
            }
        });

        throw error;
    }
}

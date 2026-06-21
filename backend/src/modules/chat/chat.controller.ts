import type { Request, Response } from "express";
import OpenAI from "openai";
import { env } from "../../config/env.js";
import type { ChatRequest } from "./chat.types.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Marko, a helpful AI assistant focused on productivity, learning, and task management. You help users with:
- Task planning and organization
- Study topics and quiz preparation
- Interview preparation tips
- Productivity advice
- Answering general questions

Be concise, friendly, and practical in your responses. Use markdown formatting when helpful.`;

export async function streamChat(req: Request, res: Response): Promise<void> {
    const body = req.body as ChatRequest;

    if (!body.messages || body.messages.length === 0) {
        res.status(400).json({ error: "Messages are required" });
        return;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...body.messages,
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(content);
            }
        }

        res.end();
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Stream failed";
        if (!res.headersSent) {
            res.status(500).json({ error: message });
        } else {
            res.write(`\n\n[ERROR] ${message}`);
            res.end();
        }
    }
}

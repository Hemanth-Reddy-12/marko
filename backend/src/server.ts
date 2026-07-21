import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { setupChatGateway } from "./modules/chat/chat.gateway.js";

const httpServer = http.createServer(app);

// Setup Socket.io gateway for local/hybrid scenarios
setupChatGateway(httpServer);

const PORT = Number.parseInt(env.PORT, 10);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    import("./lib/ai/index.js").then(async ({ getChatProvider }) => {
        try {
            const provider = await getChatProvider();
            console.log(`[AI] Connected to Provider: ${provider.info.name.toUpperCase()} | Model: ${provider.info.model}`);
        } catch (error) {
            console.log(`[AI] ⚠️ Warning: Provider not configured correctly.`);
        }
    }).catch(err => {
        console.log(`[AI] ⚠️ Failed to load AI provider module.`);
    });
});

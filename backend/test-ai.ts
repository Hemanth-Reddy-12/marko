import 'dotenv/config';

async function main() {
    const { getChatProvider } = await import("./src/lib/ai/index.js");
    const { env } = await import("./src/config/env.js");
    const provider = getChatProvider();
    console.log(`Testing generation with schema using provider: ${env.AI_PROVIDER}`);
    try {
        const result = await provider.generateStructured({
            messages: [{ role: "user", content: "Generate a sample course with 2 lessons." }]
        }, {
            type: "object",
            properties: {
                title: { type: "string" },
                lessons: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" }
                        },
                        required: ["title", "description"],
                        additionalProperties: false
                    }
                }
            },
            required: ["title", "lessons"],
            additionalProperties: false
        });
        console.log("Success:");
        console.log(result);
    } catch (e) {
        console.error("Error generating:");
        console.error(e);
    }
}

main();

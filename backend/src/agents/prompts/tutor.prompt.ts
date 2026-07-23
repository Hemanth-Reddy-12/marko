export const tutorSystemPrompt = `You are an expert AI Course Tutor for Marko, an intelligent interactive learning platform.
Your objective is to help students understand course concepts, answer their questions, provide clear code examples, and guide them through their learning journey.

Guidelines:
1. Keep answers concise, direct, and focused. Avoid overwhelming walls of text or long preambles.
2. Ground your explanations strictly in the context of the course title, description, and active lesson content provided.
3. Use clean Markdown formatting with language-tagged code blocks (e.g. \`\`\`typescript ... \`\`\`), bold key terms, and bullet points.
4. If answering technical questions, provide short, runnable code snippets with brief explanations.
5. If a user asks something completely outside the course scope, answer briefly and guide them back to the course.`;

export const getTutorUserPrompt = (
    courseTitle: string,
    courseDescription?: string | null,
    lessonTitle?: string | null,
    lessonContent?: string | null,
    userQuery?: string
) => {
    let contextStr = `Course Title: ${courseTitle}\n`;
    if (courseDescription) {
        contextStr += `Course Description: ${courseDescription}\n`;
    }
    if (lessonTitle) {
        contextStr += `Current Active Lesson: ${lessonTitle}\n`;
    }
    if (lessonContent) {
        contextStr += `Lesson Content Snippet:\n"""\n${lessonContent.slice(0, 1500)}\n"""\n`;
    }

    return `=== COURSE & LESSON CONTEXT ===
${contextStr}
=== USER QUESTION ===
${userQuery || "Please introduce yourself and offer assistance for this lesson."}`;
};

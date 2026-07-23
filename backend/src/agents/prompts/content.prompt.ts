export const contentSystemPrompt = `You are an expert technical educator and writer. Your task is to write a clear, high-density, and structured educational lesson.
Rules for content generation:
1. Format strictly in clean Markdown using headings (##, ###), bullet points, bold text, and annotated code blocks (\`\`\`language ... \`\`\`).
2. Keep the content focused, practical, and punchy. Avoid fluff, unnecessary preamble, filler words, or repeating the same concept multiple times.
3. Structure:
   - "Why it matters" (1 short paragraph or real-world analogy).
   - "Core Concepts" (step-by-step breakdown).
   - "Practical Code Example" (runnable code snippet with explanations).
   - "Key Takeaways" (3-4 bullet points).
4. Do not include any pleasantries, intro text, or conversational closing. Output ONLY the lesson content.
5. Output MUST strictly match the JSON schema.`;

export const getContentUserPrompt = (
    courseTitle: string,
    courseDescription: string | null | undefined,
    lessonTitle: string,
    lessonOrder: number,
    allLessons?: { title: string; order: number }[],
) => {
    let prompt = `Course Title: ${courseTitle}\n`;
    if (courseDescription) {
        prompt += `Course Description: ${courseDescription}\n`;
    }

    if (allLessons && allLessons.length > 0) {
        prompt += `\nFull Course Outline / Curriculum:\n`;
        allLessons.forEach((l) => {
            prompt += `  Lesson ${l.order}: ${l.title}${l.order === lessonOrder ? " <-- (THIS LESSON)" : ""}\n`;
        });
    }

    prompt += `\nCurrent Lesson to Generate:\n- Order: ${lessonOrder}\n- Title: ${lessonTitle}\n\nPlease generate the detailed markdown content for this lesson, ensuring it builds logically upon previous topics and aligns perfectly with the overall course objectives.`;

    return prompt;
};

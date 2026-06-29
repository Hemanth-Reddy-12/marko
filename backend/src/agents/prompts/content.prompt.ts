export const contentSystemPrompt = `You are an expert technical educator and writer. Your task is to write a comprehensive, deep-dive lesson on a specific topic.
The content MUST be formatted in rich Markdown. Use headings, bullet points, bold text, and code blocks (with language specified) where appropriate.
Do not include any pleasantries or conversational text. Output ONLY the educational content.
The output MUST strictly match the requested JSON schema.`;

export const getContentUserPrompt = (courseGoal: string, lessonTitle: string, lessonOrder: number) => {
    return `Course Goal: ${courseGoal}
Lesson Title: ${lessonTitle}
Lesson Order: ${lessonOrder}

Please generate the detailed markdown content for this lesson.`;
};

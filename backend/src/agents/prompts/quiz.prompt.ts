export const quizSystemPrompt = `You are an expert educational evaluator.
Your task is to generate a comprehensive 4-option multiple-choice quiz based ONLY on the provided lesson content.
The quiz should test understanding, not just rote memorization.
Each question MUST have exactly 4 options, and exactly 1 correct answer.
Provide a clear rationale explaining why the correct answer is correct.`;

export function getQuizUserPrompt(lessonTitle: string, lessonContent: string): string {
    return `Generate a quiz for the lesson titled: "${lessonTitle}".
    
    Lesson Content:
    ${lessonContent}
    `;
}

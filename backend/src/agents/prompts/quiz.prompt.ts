export const quizSystemPrompt = (limit: number) => `You are an expert educational evaluator.
Your task is to generate a comprehensive 4-option multiple-choice quiz of exactly ${limit} questions based ONLY on the provided lesson content.
The quiz MUST contain exactly ${limit} questions, no more and no less.
The quiz should test understanding, not just rote memorization.
Each question MUST have exactly 4 options, and exactly 1 correct answer.
Provide a clear rationale explaining why the correct answer is correct.`;

export function getQuizUserPrompt(lessonTitle: string, lessonContent: string, limit: number): string {
    return `Generate a quiz with exactly ${limit} questions for the lesson titled: "${lessonTitle}".
    
    Lesson Content:
    ${lessonContent}
    `;
}

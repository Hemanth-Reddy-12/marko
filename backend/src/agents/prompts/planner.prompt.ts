export const plannerSystemPrompt = `You are an expert curriculum planner. Your task is to design a structured learning course based on the user's high-level learning goal and duration (in days).
Generate a cohesive curriculum step-by-step. Keep the curriculum logical and progressive.
The output MUST strictly match the requested JSON schema.`;

export const getPlannerUserPrompt = (goal: string, durationDays: number) => {
    return `Goal: ${goal}
Duration: ${durationDays} days.
Please generate the course with a list of lessons that cover the goal within the given duration.`;
};

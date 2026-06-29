export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex?: number;
    rationale?: string;
}

export interface Quiz {
    id: string;
    version: number;
    status: "NOT_GENERATED" | "GENERATING" | "GENERATED" | "FAILED";
    questions: Question[];
}

export interface QuizAttemptPayload {
    answers: number[];
}

export interface QuizAttempt {
    id: string;
    answers: number[];
    score: number;
    passed: boolean;
    quizId: string;
    userId: string;
    createdAt: string;
}

export interface QuizAttemptResult {
    attempt: QuizAttempt;
    quiz: Quiz;
}

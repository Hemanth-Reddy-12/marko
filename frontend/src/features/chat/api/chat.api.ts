import { fetchApi } from "../../../lib/api";

export interface InitInterviewParams {
    courseId: string;
}

export interface InitInterviewResponse {
    sessionId: string;
    milestones: { topic: string; rationale: string }[];
}

export async function initInterview(params: InitInterviewParams): Promise<InitInterviewResponse> {
    return fetchApi<InitInterviewResponse>("/api/interviews", {
        method: "POST",
        body: JSON.stringify(params),
    });
}

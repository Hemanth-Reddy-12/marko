export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const url = `${base}${path}`;
    const response = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        ...init,
    });
    if (!response.ok) {
        const text = await response.text();
        let errMsg = `${response.status} ${response.statusText}`;
        try {
            const parsed = JSON.parse(text);
            errMsg = parsed.error ?? JSON.stringify(parsed);
        } catch (_) {}
        throw new Error(errMsg);
    }
    // 204 No Content
    if (response.status === 204) return undefined as unknown as T;
    return (await response.json()) as T;
}

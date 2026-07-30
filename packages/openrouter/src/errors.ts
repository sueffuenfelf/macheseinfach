export class OpenRouterError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(message: string, status: number, body?: unknown) {
        super(message);
        this.name = 'OpenRouterError';
        this.status = status;
        this.body = body;
    }
}

export function openRouterErrorMessage(status: number, body: unknown): string {
    if (status === 401) {
        return 'OpenRouter API key is invalid or missing (401)';
    }
    if (status === 429) {
        return 'OpenRouter rate limit exceeded (429)';
    }
    if (typeof body === 'object' && body !== null && 'error' in body) {
        const err = (body as { error?: { message?: string } }).error;
        if (err?.message) {
            return err.message;
        }
    }
    return `OpenRouter request failed (${status})`;
}

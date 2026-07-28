const SENSITIVE_PATTERNS = [
    /\bpassw[oö]rt\b/i,
    /\bpassword\b/i,
    /\bapi[_-]?key\b/i,
    /\bsecret\b/i,
    /\btoken\b/i,
    /\bprivate[_-]?key\b/i,
    /\bbearer\s+[a-z0-9._-]{12,}/i,
];

/** Heuristic: warn when chat content may contain secrets (not a security guarantee). */
export function looksSensitiveContent(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) return false;
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

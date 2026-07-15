/** Yield to the main thread so the UI stays responsive between batch steps. */
export function yieldToMain(): Promise<void> {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => resolve());
            return;
        }
        setTimeout(resolve, 0);
    });
}

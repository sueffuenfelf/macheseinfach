import { useMemo } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * Runs a pure compute function on a debounced input.
 * Sync only — wrap async work in the shell itself.
 */
export function useLiveCompute<TInput, TResult>(
    input: TInput,
    compute: (input: TInput) => TResult,
    delayMs = 200,
): TResult {
    const debounced = useDebouncedValue(input, delayMs);
    return useMemo(() => compute(debounced), [compute, debounced]);
}

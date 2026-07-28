import { useCallback, useReducer } from 'react';

type HistoryState<T> = {
    past: T[];
    present: T;
    future: T[];
};

type HistoryAction<T> =
    | { type: 'set'; value: T }
    | { type: 'update'; updater: (current: T) => T }
    | { type: 'replace'; value: T }
    | { type: 'undo' }
    | { type: 'redo' }
    | { type: 'reset'; value: T };

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
    switch (action.type) {
        case 'set':
            return {
                past: [...state.past, state.present],
                present: action.value,
                future: [],
            };
        case 'update':
            return {
                past: [...state.past, state.present],
                present: action.updater(state.present),
                future: [],
            };
        case 'replace':
            return { ...state, present: action.value };
        case 'undo': {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1] as T;
            return {
                past: state.past.slice(0, -1),
                present: previous,
                future: [state.present, ...state.future],
            };
        }
        case 'redo': {
            if (state.future.length === 0) return state;
            const next = state.future[0] as T;
            return {
                past: [...state.past, state.present],
                present: next,
                future: state.future.slice(1),
            };
        }
        case 'reset':
            return { past: [], present: action.value, future: [] };
    }
}

export function useUndoRedo<T>(initial: T) {
    const [state, dispatch] = useReducer(historyReducer<T>, {
        past: [],
        present: initial,
        future: [],
    });

    const set = useCallback((value: T) => {
        dispatch({ type: 'set', value });
    }, []);

    const update = useCallback((updater: (current: T) => T) => {
        dispatch({ type: 'update', updater });
    }, []);

    const replace = useCallback((value: T) => {
        dispatch({ type: 'replace', value });
    }, []);

    const undo = useCallback(() => {
        dispatch({ type: 'undo' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'redo' });
    }, []);

    const reset = useCallback((value: T) => {
        dispatch({ type: 'reset', value });
    }, []);

    return {
        value: state.present,
        set,
        update,
        replace,
        undo,
        redo,
        reset,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
    };
}

export function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

export function isModKey(event: KeyboardEvent): boolean {
    return event.metaKey || event.ctrlKey;
}

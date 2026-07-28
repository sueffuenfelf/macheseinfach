/**
 * Feature flag: flowWorkspace — Workspace-UI + Context hinter Flag.
 * Default ON — multi-step Vorhaben use the split workspace.
 *
 * Disable via:
 * - `VITE_FLOW_WORKSPACE=false` at build/dev time
 * - runtime: `localStorage.setItem('msf.flowWorkspace', '0')`
 */
export const FLOW_WORKSPACE_FLAG = 'flowWorkspace' as const;
const STORAGE_KEY = 'msf.flowWorkspace';

export function isFlowWorkspaceEnabled(): boolean {
    try {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === '0' || stored === 'false') return false;
            if (stored === '1' || stored === 'true') return true;
        }
    } catch {
        // private mode / SSR
    }

    try {
        const env = import.meta.env?.VITE_FLOW_WORKSPACE;
        if (env === 'false' || env === '0') return false;
        if (env === 'true' || env === '1') return true;
    } catch {
        // non-Vite runtime
    }

    return true;
}

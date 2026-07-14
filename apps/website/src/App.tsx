import { PlatformProvider } from './context/PlatformContext';
import { ToolShell } from './shell/ToolShell';

export function App() {
    return (
        <PlatformProvider>
            <ToolShell />
        </PlatformProvider>
    );
}

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformProvider } from './context/PlatformContext';
import { SettingsProvider } from './context/SettingsContext';
import { PlatformRouterSync, TagUrlSync } from './routing/PlatformRouterSync';
import { ToolShell } from './shell/ToolShell';
import { ToastProvider, ToastViewport } from './shell/toast';

export function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <SettingsProvider>
                    <PlatformProvider>
                        <PlatformRouterSync />
                        <TagUrlSync />
                        <Routes>
                            <Route path="/*" element={<ToolShell />} />
                        </Routes>
                        <ToastViewport />
                    </PlatformProvider>
                </SettingsProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

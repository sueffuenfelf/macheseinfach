import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ImageArtifactProvider } from './context/ImageArtifactContext';
import { PlatformProvider } from './context/PlatformContext';
import { SettingsProvider } from './context/SettingsContext';
import { PlatformRouterSync, TagUrlSync } from './routing/PlatformRouterSync';
import { RouteRedirects } from './routing/RouteRedirects';
import { JobDock, JobQueueBridge } from './shell/jobs';
import { SessionSplash } from './shell/SessionSplash';
import { ToolShell } from './shell/ToolShell';
import { ToastProvider, ToastViewport } from './shell/toast';

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <SessionSplash>
            <ToastProvider onNavigate={(href) => navigate(href)}>
                <JobQueueBridge>
                    <PlatformProvider>
                        <RouteRedirects />
                        <PlatformRouterSync />
                        <TagUrlSync />
                        <Routes>
                            <Route path="/*" element={<ToolShell />} />
                        </Routes>
                        <ToastViewport />
                        <JobDock />
                    </PlatformProvider>
                </JobQueueBridge>
            </ToastProvider>
        </SessionSplash>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <ImageArtifactProvider>
                    <AppRoutes />
                </ImageArtifactProvider>
            </SettingsProvider>
        </BrowserRouter>
    );
}

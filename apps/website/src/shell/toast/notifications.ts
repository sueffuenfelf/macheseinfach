import type { ToastItem } from './types';

type NotificationSettings = {
    backgroundNotifications: boolean;
};

let navigateHandler: ((href: string) => void) | null = null;

export function setToastNavigateHandler(handler: (href: string) => void): void {
    navigateHandler = handler;
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') return Promise.resolve('denied');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    if (Notification.permission === 'denied') return Promise.resolve('denied');
    return Notification.requestPermission();
}

function isBackgroundNotificationsEnabled(settings: NotificationSettings): boolean {
    return settings.backgroundNotifications && typeof Notification !== 'undefined';
}

export function maybeShowSystemNotification(item: ToastItem, settings: NotificationSettings): void {
    if (!isBackgroundNotificationsEnabled(settings)) return;
    if (typeof document !== 'undefined' && !document.hidden) return;
    if (Notification.permission !== 'granted') return;

    const title = item.title || item.message;
    const body = item.title ? item.message : undefined;
    const tag = item.context?.jobId ?? item.id;

    try {
        const notification = new Notification(title, {
            body,
            tag,
            data: {
                href: item.context?.route,
                toastId: item.id,
            },
        });

        notification.onclick = () => {
            window.focus();
            const href = notification.data?.href as string | undefined;
            if (href && navigateHandler) navigateHandler(href);
            notification.close();
        };
    } catch {
        /* Safari / blocked */
    }
}

export function attachBackgroundNotificationBridge(
    settings: NotificationSettings,
    onBackgroundToast: (item: ToastItem) => void,
): () => void {
    const handler = () => {
        if (!document.hidden) return;
        if (!settings.backgroundNotifications) return;
        /* Actual dispatch happens per-toast in toast() */
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
}

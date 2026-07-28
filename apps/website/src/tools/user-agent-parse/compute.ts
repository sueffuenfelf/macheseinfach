import type { PasteFinding } from '../_shared/shells';

type ParsedUa = {
    browser: string;
    browserVersion: string;
    os: string;
    device: string;
    engine: string;
    mobile: boolean;
};

/** Lightweight UA parse — no external UA database. */
export function parseUserAgent(ua: string): ParsedUa {
    const s = ua.trim();
    let browser = 'Unbekannt';
    let browserVersion = '';
    let engine = '';
    let os = 'Unbekannt';
    let device = 'Desktop / sonstig';
    let mobile = /Mobile|Android|iPhone|iPad|iPod/i.test(s);

    const browserMatchers: Array<[RegExp, string]> = [
        [/Edg\/([\d.]+)/i, 'Edge'],
        [/OPR\/([\d.]+)/i, 'Opera'],
        [/Chrome\/([\d.]+)/i, 'Chrome'],
        [/Firefox\/([\d.]+)/i, 'Firefox'],
        [/Version\/([\d.]+).*Safari/i, 'Safari'],
        [/MSIE ([\d.]+)/i, 'Internet Explorer'],
        [/Trident\/.*rv:([\d.]+)/i, 'Internet Explorer'],
    ];
    for (const [re, name] of browserMatchers) {
        const m = s.match(re);
        if (m) {
            // Prefer Edge/Opera before Chrome
            if (name === 'Chrome' && /Edg\/|OPR\//i.test(s)) continue;
            if (name === 'Safari' && /Chrome\/|Chromium\//i.test(s)) continue;
            browser = name;
            browserVersion = m[1] ?? '';
            break;
        }
    }

    if (/Gecko\//i.test(s) && /Firefox\//i.test(s)) engine = 'Gecko';
    else if (/AppleWebKit\//i.test(s)) engine = 'WebKit / Blink';
    else if (/Trident\//i.test(s)) engine = 'Trident';

    if (/Windows NT 10/i.test(s)) os = 'Windows 10/11';
    else if (/Windows NT 6\.3/i.test(s)) os = 'Windows 8.1';
    else if (/Windows NT 6\.1/i.test(s)) os = 'Windows 7';
    else if (/Mac OS X ([\d_]+)/i.test(s)) {
        const m = s.match(/Mac OS X ([\d_]+)/i);
        os = `macOS ${(m?.[1] ?? '').replace(/_/g, '.')}`;
    } else if (/Android ([\d.]+)/i.test(s)) {
        const m = s.match(/Android ([\d.]+)/i);
        os = `Android ${m?.[1] ?? ''}`;
    } else if (/iPhone OS ([\d_]+)/i.test(s) || /CPU OS ([\d_]+)/i.test(s)) {
        const m = s.match(/(?:iPhone OS|CPU OS) ([\d_]+)/i);
        os = `iOS ${(m?.[1] ?? '').replace(/_/g, '.')}`;
    } else if (/Linux/i.test(s)) os = 'Linux';
    else if (/CrOS/i.test(s)) os = 'Chrome OS';

    if (/iPad/i.test(s)) {
        device = 'Tablet (iPad)';
        mobile = true;
    } else if (/iPhone/i.test(s)) {
        device = 'Smartphone (iPhone)';
        mobile = true;
    } else if (/Android/i.test(s) && /Mobile/i.test(s)) {
        device = 'Smartphone (Android)';
        mobile = true;
    } else if (/Android/i.test(s)) {
        device = 'Tablet / Android';
        mobile = true;
    } else if (mobile) {
        device = 'Mobilgerät';
    }

    return { browser, browserVersion, os, device, engine, mobile };
}

/** Analyze a User-Agent string into findings. */
export function analyzeUserAgent(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Kein User-Agent',
                detail: 'User-Agent-String einfügen (z. B. aus DevTools / Support-Ticket).',
            },
        ];
    }

    const p = parseUserAgent(trimmed);
    return [
        {
            id: 'browser',
            severity: 'ok',
            title: 'Browser',
            detail: p.browserVersion ? `${p.browser} ${p.browserVersion}` : p.browser,
        },
        {
            id: 'os',
            severity: 'info',
            title: 'Betriebssystem',
            detail: p.os,
        },
        {
            id: 'device',
            severity: 'info',
            title: 'Gerät',
            detail: `${p.device}${p.mobile ? ' · mobil' : ''}`,
        },
        ...(p.engine
            ? [
                  {
                      id: 'engine',
                      severity: 'info' as const,
                      title: 'Engine',
                      detail: p.engine,
                  },
              ]
            : []),
        {
            id: 'raw-len',
            severity: 'info',
            title: 'Länge',
            detail: `${trimmed.length} Zeichen`,
        },
    ];
}

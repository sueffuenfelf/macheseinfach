import { definePasteTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { analyzeEmailHeaders } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'email-header-check',
            slug: 'email-header-check',
            shortTitle: 'E-Mail-Header',
            title: 'E-Mail-Header prüfen',
            sub: 'Phishing-Indikatoren aus Header-Text erkennen — lokal analysiert.',
            pain: 'Verdächtige Mail — will wissen, ob Absender und Authentifizierung passen.',
            solution: 'Header einfügen, Heuristiken für SPF/DKIM und Absender prüfen.',
            trust: TRUST_LOCAL,
            tags: ['E-Mail', 'Security', 'Prüfen'],
            keywords: ['email', 'header', 'phishing', 'spf', 'dkim', 'dmarc', 'spam'],
            fileHints: [],
            command: '/email-header',
            entry: 'form',
            entryPlaceholder: 'Received: from …',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        analyze: analyzeEmailHeaders,
        placeholder: 'Received: from mail.example.com …\nFrom: …\nAuthentication-Results: …',
        intro: TRUST_LOCAL,
    },
    'email-header-check',
);

import { defineCheckTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { checkUrlPhishing } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'url-phishing-check',
            slug: 'url-phishing-check',
            shortTitle: 'Link prüfen',
            title: 'URL auf Phishing prüfen',
            sub: 'IDN, Homographen und verdächtige Muster erkennen — lokal, ohne Fetch.',
            pain: 'Link in Mail oder Chat — unsicher, ob er echt ist.',
            solution: 'URL einfügen, Warnhinweise zu Domain und TLD erhalten.',
            trust: TRUST_LOCAL,
            tags: ['Security', 'Prüfen', 'E-Mail'],
            keywords: ['url', 'phishing', 'link', 'idn', 'homograph', 'betrug', 'prüfen'],
            fileHints: [],
            command: '/url-check',
            entry: 'form',
            entryPlaceholder: 'https://beispiel.de/…',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: ['story-phishing-link'],
        },
        fields: [
            {
                id: 'url',
                type: 'text',
                label: 'URL',
                placeholder: 'https://beispiel.de/pfad',
            },
        ],
        check: checkUrlPhishing,
        autoCheck: true,
        trustNote: `${TRUST_LOCAL} Es wird keine Anfrage an die Ziel-URL gesendet.`,
    },
    'url-phishing-check',
);

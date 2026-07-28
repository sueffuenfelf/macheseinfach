import { definePasteTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { analyzeCertificate } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'cert-viewer',
            slug: 'cert-viewer',
            shortTitle: 'Zertifikat',
            title: 'X.509-Zertifikat anzeigen',
            sub: 'PEM-Zertifikat einfügen — Subject, Issuer und Gültigkeit lokal auslesen.',
            pain: 'Zertifikat-Text vorliegen — will Details ohne openssl.',
            solution: 'PEM einfügen, Browser-API liest die Felder aus.',
            trust: TRUST_LOCAL,
            tags: ['Security', 'Prüfen'],
            keywords: ['zertifikat', 'x509', 'pem', 'ssl', 'tls', 'certificate'],
            fileHints: [],
            command: '/cert',
            entry: 'form',
            entryPlaceholder: '-----BEGIN CERTIFICATE-----',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        analyze: analyzeCertificate,
        placeholder: '-----BEGIN CERTIFICATE-----\nMIID…\n-----END CERTIFICATE-----',
        intro: TRUST_LOCAL,
    },
    'cert-viewer',
);

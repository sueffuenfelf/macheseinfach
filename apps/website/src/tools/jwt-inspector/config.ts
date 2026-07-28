import { definePasteTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { analyzeJwt } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'jwt-inspector',
            slug: 'jwt-inspector',
            shortTitle: 'JWT lesen',
            title: 'JWT inspizieren',
            sub: 'Header und Payload eines JSON Web Tokens lokal dekodieren.',
            pain: 'JWT-String erhalten — will Inhalt verstehen, ohne Online-Tools.',
            solution: 'Einfügen und lesen — Signatur wird nicht geprüft.',
            trust: TRUST_LOCAL,
            tags: ['JWT', 'Security', 'Prüfen'],
            keywords: ['jwt', 'token', 'decode', 'json', 'bearer', 'oauth'],
            fileHints: [],
            command: '/jwt',
            entry: 'form',
            entryPlaceholder: 'eyJhbGciOiJIUzI1NiIs…',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security', 'web'],
            storyIds: [],
        },
        analyze: analyzeJwt,
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0…',
        intro: TRUST_LOCAL,
    },
    'jwt-inspector',
);

import { definePasteTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { analyzePgpKey } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'pgp-key-info',
            slug: 'pgp-key-info',
            shortTitle: 'OpenPGP-Key',
            title: 'OpenPGP-Key anzeigen',
            sub: 'Armored Key-Block einfügen — Typ und Metadaten lokal auslesen.',
            pain: 'PGP-Key vorliegen — will wissen, was drin steckt.',
            solution: 'Block einfügen, Typ und Kommentare anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Security', 'Prüfen'],
            keywords: ['pgp', 'gpg', 'openpgp', 'key', 'public key', 'fingerprint'],
            fileHints: [],
            command: '/pgp',
            entry: 'form',
            entryPlaceholder: '-----BEGIN PGP PUBLIC KEY BLOCK-----',
            theme: SECURITY_THEME,
            maturity: 'beta',
            areas: ['security'],
            storyIds: [],
        },
        analyze: analyzePgpKey,
        placeholder: '-----BEGIN PGP PUBLIC KEY BLOCK-----\nComment: Max Mustermann <max@beispiel.de>\n…',
        intro: `${TRUST_LOCAL} Fingerprint-Berechnung ist in v1 nicht enthalten — nur Block-Metadaten.`,
    },
    'pgp-key-info',
);

import type { CheckResult, FieldValues } from '../_shared/shells';

type RetentionRule = {
    label: string;
    years: number;
    basis: string;
    hint: string;
};

const RULES: Record<string, RetentionRule> = {
    invoice: {
        label: 'Rechnungen / Buchungsbelege',
        years: 10,
        basis: '§ 147 AO, § 257 HGB (steuerlich / handelsrechtlich)',
        hint: 'Aufbewahrung in der Regel 10 Jahre ab Ende des Kalenderjahres.',
    },
    letter: {
        label: 'Geschäftsbriefe (Ein-/Ausgang)',
        years: 6,
        basis: '§ 257 HGB',
        hint: '6 Jahre ab Ende des Kalenderjahres — empfangen oder abgesendet.',
    },
    contract: {
        label: 'Verträge',
        years: 10,
        basis: '§ 257 HGB (handelsrechtlich, vereinfacht)',
        hint: 'Oft 10 Jahre — abhängig von Vertragstyp und Unternehmerstatus.',
    },
    payroll: {
        label: 'Lohnunterlagen',
        years: 6,
        basis: '§ 41b EStG (Lohnsteuer)',
        hint: 'Mindestens 6 Jahre — Sozialversicherung kann länger verlangen.',
    },
    email: {
        label: 'E-Mails (geschäftlich)',
        years: 6,
        basis: 'Wie Geschäftsbriefe, falls steuerlich relevant',
        hint: 'Nicht jede Mail — nur geschäftsrelevante Kommunikation.',
    },
};

export function checkRetentionPeriod(values: FieldValues): CheckResult {
    const docType = values.documentType ?? '';
    const rule = RULES[docType];

    if (!rule) {
        return {
            ok: false,
            tone: 'info',
            heading: 'Belegtyp wählen',
            message: 'Bitte einen Dokumenttyp auswählen.',
        };
    }

    return {
        ok: true,
        tone: 'info',
        heading: `${rule.years} Jahre (grob)`,
        summary: rule.label,
        details: [
            { label: 'Aufbewahrung', value: `${rule.years} Jahre` },
            { label: 'Rechtsgrundlage', value: rule.basis },
            { label: 'Hinweis', value: rule.hint },
        ],
        message: 'Keine Rechtsberatung — Fristen können im Einzelfall abweichen.',
    };
}

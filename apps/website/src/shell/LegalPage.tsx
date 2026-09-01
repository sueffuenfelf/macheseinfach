import { AppPageHeader, PageContainer } from './PageContainer';

type LegalKind = 'imprint' | 'privacy';

const COPY: Record<
    LegalKind,
    { title: string; subtitle: string; sections: { heading: string; body: string }[] }
> = {
    imprint: {
        title: 'Impressum',
        subtitle: 'Angaben gemäß Digitale-Dienste-Gesetz (DDG).',
        sections: [
            {
                heading: 'Anbieter',
                body: 'macheseinfa.ch ist ein Angebot von Kounds (Sofien). Die Website stellt lokale Browser-Tools bereit — ohne Nutzerkonto und ohne Datei-Upload auf eigene Server.',
            },
            {
                heading: 'Kontakt',
                body: 'E-Mail über die auf macheseinfa.ch bzw. kounds.dev hinterlegten Kontaktwege. Quelltext: öffentlich auf GitHub.',
            },
            {
                heading: 'Haftung',
                body: 'Die Tools laufen ausschließlich im Browser des Nutzers. Für die Richtigkeit der Ergebnisse und für Inhalte verlinkter Dritter wird keine Gewähr übernommen.',
            },
        ],
    },
    privacy: {
        title: 'Datenschutz',
        subtitle: 'Verarbeitung findet lokal im Browser statt.',
        sections: [
            {
                heading: 'Grundsatz',
                body: 'Dateien und Texte, die du in den Tools verwendest, verlassen deinen Rechner nicht. Es gibt kein Nutzerkonto und keinen Server-Upload für Tool-Inhalte.',
            },
            {
                heading: 'Technische Zugriffe',
                body: 'Beim Aufruf der Website können übliche Server- und CDN-Protokolle (IP, Zeitpunkt, User-Agent) anfallen. Es werden keine Tracking-Cookies zu Werbezwecken gesetzt.',
            },
            {
                heading: 'Lokale Speicherung',
                body: 'Einstellungen, Favoriten und ähnliche Präferenzen können im localStorage deines Browsers liegen. Du kannst sie jederzeit im Browser löschen.',
            },
        ],
    },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
    const copy = COPY[kind];
    return (
        <PageContainer className="py-6 md:py-8">
            <AppPageHeader showBack title={copy.title} subtitle={copy.subtitle} />
            <div className="space-y-6">
                {copy.sections.map((section) => (
                    <section key={section.heading}>
                        <h2 className="font-display text-[16px] font-bold">{section.heading}</h2>
                        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                            {section.body}
                        </p>
                    </section>
                ))}
            </div>
        </PageContainer>
    );
}

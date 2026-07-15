import { Link } from 'react-router-dom';
import { stories } from '../data/catalog';
import { newWorkspacePath } from '../routing/paths';
import { BackButton } from './components/Primitives';

export function BildPipelineStory() {
    const story = stories['story-bild-pipeline'];

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-8">
            <BackButton />

            <h1 className="mt-6 font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">
                {story.outcome}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                {story.situation} Konvertieren, komprimieren, verkleinern und Metadaten entfernen —
                verkettet in einem Arbeitsbereich.
            </p>

            <section className="mt-8 max-w-[520px] rounded-[14px] border-2 border-black bg-white p-5 shadow-brutal">
                <h2 className="font-display text-[18px] font-bold">Vorlage „Bild-Portal"</h2>
                <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                    HEIC → JPG · Komprimieren · max. 1920 px · EXIF entfernen — als verknüpfte
                    Widgets. Aktiviere in den Einstellungen „Erweiterte Widget-Verknüpfungen".
                </p>
                <Link
                    to={newWorkspacePath('bild-portal')}
                    className="ms-btn-primary mt-4 inline-flex w-full justify-center py-2.5 text-[13px] font-semibold"
                >
                    Arbeitsbereich erstellen
                </Link>
            </section>
        </main>
    );
}

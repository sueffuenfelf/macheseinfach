import { useMemo } from 'react';
import {
    allCatalogTags,
    groupCatalogTags,
    tagsForStory,
    tagsInArea,
    toolsForStory,
} from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';
import { SectionLabel } from './components/Primitives';

type TagFilterProps = {
    /** Inline auf Situations-Seiten — ohne globale Shell-Leiste */
    embedded?: boolean;
};

export function TagFilter({ embedded = false }: TagFilterProps) {
    const { activeAreaId, activeStoryId, activeTool, activeTags, toggleTag } = usePlatform();

    const contextualTags = useMemo(() => {
        if (activeStoryId && !activeTool && toolsForStory(activeStoryId).length > 1) {
            return tagsForStory(activeStoryId);
        }
        if (activeAreaId) return tagsInArea(activeAreaId);
        return allCatalogTags();
    }, [activeAreaId, activeStoryId, activeTool]);

    const groupedTags = useMemo(() => groupCatalogTags(contextualTags), [contextualTags]);

    if (contextualTags.length === 0) return null;

    const content = (
        <div className="space-y-3">
            {groupedTags.map((group) => (
                <div key={group.groupId}>
                    <SectionLabel className="mb-1.5">{group.label}</SectionLabel>
                    <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label={`Tags: ${group.label}`}
                    >
                        {group.tags.map((tag) => {
                            const selected = activeTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    aria-pressed={selected}
                                    className={`ms-focus rounded-full border-2 px-3 py-1.5 font-display text-[13px] font-semibold transition ${
                                        selected
                                            ? 'border-black bg-black text-white shadow-brutal-sm'
                                            : 'border-black bg-white text-black shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal'
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    if (embedded) {
        return (
            <section className="mt-6" aria-label="Nach Tag filtern">
                {content}
            </section>
        );
    }

    return (
        <section
            className="border-b-2 border-black bg-[var(--color-chip)]"
            aria-label="Nach Tag filtern"
        >
            <div className="mx-auto w-full max-w-[1040px] px-4 py-4 md:px-6">{content}</div>
        </section>
    );
}

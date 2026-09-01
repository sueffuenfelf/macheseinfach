import { useMemo, useState } from 'react';
import { usePlatformNav } from '../routing/usePlatformNav';
import { LandingHome } from './LandingHome';
import { landingRecentTools, resolveLandingOptions } from './landing-options';

export function AreaStep() {
    const { selectArea, selectTool, recentTools } = usePlatformNav();
    const [query, setQuery] = useState('');
    const options = useMemo(() => resolveLandingOptions(query), [query]);
    const recents = useMemo(() => landingRecentTools(recentTools, query), [recentTools, query]);

    const submit = () => {
        const firstTool = options.tools[0] ?? recents[0];
        if (firstTool) {
            selectTool(firstTool.id);
            return;
        }
        const firstArea = options.areas[0];
        if (firstArea) selectArea(firstArea.id);
    };

    return (
        <LandingHome
            query={query}
            onQueryChange={setQuery}
            onSubmit={submit}
            areas={options.areas}
            tools={options.tools}
            recentTools={recents}
            onSelectArea={selectArea}
            onSelectTool={selectTool}
        />
    );
}

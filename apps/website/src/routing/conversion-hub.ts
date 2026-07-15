/** Story IDs that render a hub page instead of auto-opening a single tool. */
const CONVERSION_HUB_STORY_IDS = new Set(['story-bild-format-aendern']);

export function isConversionHubStory(storyId: string): boolean {
    return CONVERSION_HUB_STORY_IDS.has(storyId);
}

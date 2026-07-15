import { usePlatformNav } from '../../../routing/usePlatformNav';
import { useImageArtifacts } from '../../../context/ImageArtifactContext';
import type { ToolId } from '../../../data/catalog/types';
import { getNextImagePipelineStep } from '../image/pipeline';

type ContinueWithNextToolProps = {
    toolId: ToolId;
    resultBlob: Blob;
    resultFilename: string;
};

export function ContinueWithNextTool({ toolId, resultBlob, resultFilename }: ContinueWithNextToolProps) {
    const { selectTool } = usePlatformNav();
    const { setPendingArtifactId, createFromBlob } = useImageArtifacts();
    const next = getNextImagePipelineStep(toolId);

    if (!next) return null;

    async function handleContinue() {
        const artifact = await createFromBlob(resultBlob, resultFilename);
        setPendingArtifactId(artifact.id);
        selectTool(next!.toolId);
    }

    return (
        <button type="button" className="ms-btn w-full" onClick={() => void handleContinue()}>
            Weiter mit {next.label} …
        </button>
    );
}

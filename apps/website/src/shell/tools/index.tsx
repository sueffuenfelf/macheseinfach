import type { Tool } from '../../data/catalog';
import { GenericFileTool } from './GenericFileTool';
import { GiroCodeTool } from './GiroCodeTool';
import { HeicTool } from './HeicTool';
import { IbanCheckTool } from './IbanCheckTool';
import { LeakCheckTool } from './LeakCheckTool';
import { PdfCompressTool } from './PdfCompressTool';
import { PdfRedactTool } from './PdfRedactTool';
import { PlannedTool } from './PlannedTool';

export function ToolBody({ tool }: { tool: Tool }) {
    switch (tool.id) {
        case 'girocode-gen':
            return <GiroCodeTool tool={tool} />;
        case 'iban-validate':
            return <IbanCheckTool tool={tool} />;
        case 'pdf-compress':
            return <PdfCompressTool tool={tool} />;
        case 'pdf-redact':
            return <PdfRedactTool tool={tool} />;
        case 'heic-convert':
            return <HeicTool tool={tool} />;
        case 'pwned-check':
            return <LeakCheckTool tool={tool} />;
        case 'pdf-merge':
        case 'pdf-sign':
        case 'ocr-local':
        case 'epc-read':
            return <GenericFileTool tool={tool} />;
        default:
            return <PlannedTool tool={tool} />;
    }
}

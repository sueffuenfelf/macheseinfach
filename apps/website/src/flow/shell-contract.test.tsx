import { describe, expect, test } from 'bun:test';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsProvider } from '../context/SettingsContext';
import type { FlowContextSchema, FlowStepBindings, ToolDefinition } from '../data/catalog/types';
import { ToastProvider } from '../shell/toast';
import { CheckToolShell } from '../tools/_shared/shells/CheckToolShell';
import { EditorToolShell } from '../tools/_shared/shells/EditorToolShell';
import { ExtractToolShell } from '../tools/_shared/shells/ExtractToolShell';
import { FilePipelineToolShell } from '../tools/_shared/shells/FilePipelineToolShell';
import { PasteAnalyzeToolShell } from '../tools/_shared/shells/PasteAnalyzeToolShell';
import type { FieldDef } from '../tools/_shared/shells/types';
import { FlowContextProvider } from './FlowContextProvider';
import { chipLabelFromSlot, decodeFile, decodeFormString, encodeForSlot } from './slot-codec';
import { resolveBindingSlotId } from './useFlowInput';

function withAppProviders(node: ReactNode) {
    return (
        <SettingsProvider>
            <ToastProvider>{node}</ToastProvider>
        </SettingsProvider>
    );
}

const stubTool = (id: string, overrides: Partial<ToolDefinition> = {}): ToolDefinition => ({
    id,
    slug: id,
    shortTitle: id,
    title: id,
    sub: '',
    pain: '',
    solution: '',
    trust: '',
    tags: [],
    keywords: [],
    fileHints: [],
    command: `/${id}`,
    entry: 'form',
    theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
    maturity: 'stable',
    areas: ['buchhaltung'],
    storyIds: [],
    ...overrides,
});

const ibanFields: readonly FieldDef[] = [
    {
        id: 'iban',
        type: 'text',
        label: 'IBAN',
        placeholder: 'DE89 …',
        mono: true,
    },
];

function renderCheck(opts: {
    withProvider?: boolean;
    initialSlots?: Record<string, import('./context-types').FlowSlotValue>;
}) {
    const schema: FlowContextSchema = {
        slots: [{ id: 'iban', kind: 'iban', label: 'IBAN' }],
    };
    const stepBindings: FlowStepBindings = {
        'iban-check': { iban: 'iban' },
    };
    const tool = stubTool('iban-check');
    const shell = (
        <CheckToolShell
            tool={tool}
            fields={ibanFields}
            check={() => ({
                ok: true,
                tone: 'success',
                heading: 'OK',
                message: 'gültig',
            })}
            autoCheck={false}
        />
    );

    if (!opts.withProvider) {
        return renderToStaticMarkup(shell);
    }

    return renderToStaticMarkup(
        <FlowContextProvider
            flowId="story-test-iban"
            schema={schema}
            stepBindings={stepBindings}
            initialSlots={opts.initialSlots}
        >
            {shell}
        </FlowContextProvider>,
    );
}

describe('resolveBindingSlotId', () => {
    test('resolves tool input key to slot', () => {
        expect(resolveBindingSlotId({ 't-1': { iban: 'slot-iban' } }, 't-1', 'iban')).toBe(
            'slot-iban',
        );
    });

    test('returns undefined without binding', () => {
        expect(resolveBindingSlotId({}, 't-1', 'iban')).toBeUndefined();
    });
});

describe('slot-codec', () => {
    test('decodeFormString reads iban/text', () => {
        expect(decodeFormString({ kind: 'iban', value: 'DE89' })).toBe('DE89');
        expect(decodeFormString(null)).toBeNull();
    });

    test('decodeFile reads file/image', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
        expect(decodeFile({ kind: 'file', file, name: file.name, byteSize: file.size })).toBe(file);
        expect(decodeFile({ kind: 'text', value: 'nope' })).toBeNull();
    });

    test('encodeForSlot write-through for iban', () => {
        const schema: FlowContextSchema = {
            slots: [{ id: 'iban', kind: 'iban', label: 'IBAN' }],
        };
        expect(encodeForSlot(schema, 'iban', 'DE89 3704')).toEqual({
            kind: 'iban',
            value: 'DE89 3704',
        });
    });

    test('chipLabelFromSlot prefers file name', () => {
        const file = new File(['x'], 'nachweis.pdf', { type: 'application/pdf' });
        expect(
            chipLabelFromSlot({
                kind: 'file',
                file,
                name: 'nachweis.pdf',
                byteSize: file.size,
            }),
        ).toBe('nachweis.pdf');
    });
});

describe('shell contract: CheckToolShell', () => {
    test('filled flow binding → no IBAN input, Chip visible', () => {
        const html = renderCheck({
            withProvider: true,
            initialSlots: { iban: { kind: 'iban', value: 'DE89370400440532013000' } },
        });
        expect(html).toContain('Aus Vorhaben:');
        expect(html).toContain('DE89370400440532013000');
        expect(html).toContain('Ändern');
        expect(html).toContain('data-testid="flow-bound-chip"');
        expect(html).not.toContain('id="iban-check-iban"');
        expect(html).not.toContain('data-flow-source="local"');
    });

    test('/tool without provider → IBAN input visible, no Chip', () => {
        const html = renderCheck({ withProvider: false });
        expect(html).toContain('id="iban-check-iban"');
        expect(html).toContain('data-flow-source="local"');
        expect(html).not.toContain('Aus Vorhaben:');
        expect(html).not.toContain('data-testid="flow-bound-chip"');
    });

    test('provider + binding but empty slot → local input visible', () => {
        const html = renderCheck({ withProvider: true, initialSlots: {} });
        expect(html).toContain('id="iban-check-iban"');
        expect(html).toContain('data-flow-source="local"');
        expect(html).not.toContain('data-testid="flow-bound-chip"');
    });
});

describe('shell contract: PasteAnalyzeToolShell', () => {
    test('filled paste binding → no textarea, Chip visible', () => {
        const schema: FlowContextSchema = {
            slots: [{ id: 'body', kind: 'multiline', label: 'Text' }],
        };
        const stepBindings: FlowStepBindings = {
            'paste-tool': { paste: 'body' },
        };
        const html = renderToStaticMarkup(
            <FlowContextProvider
                flowId="story-paste"
                schema={schema}
                stepBindings={stepBindings}
                initialSlots={{ body: { kind: 'multiline', value: 'secret leak text' } }}
            >
                <PasteAnalyzeToolShell tool={stubTool('paste-tool')} analyze={() => []} />
            </FlowContextProvider>,
        );
        expect(html).toContain('Aus Vorhaben:');
        expect(html).toContain('data-testid="flow-bound-chip"');
        expect(html).not.toContain('data-testid="paste-primary-input"');
        expect(html).not.toContain('id="paste-tool-paste"');
    });

    test('without provider → textarea visible', () => {
        const html = renderToStaticMarkup(
            <PasteAnalyzeToolShell tool={stubTool('paste-tool')} analyze={() => []} />,
        );
        expect(html).toContain('data-testid="paste-primary-input"');
        expect(html).not.toContain('Aus Vorhaben:');
    });
});

describe('shell contract: ExtractToolShell (file)', () => {
    test('filled source binding → no file input, Chip visible', () => {
        const file = new File(['pdf'], 'scan.pdf', { type: 'application/pdf' });
        const schema: FlowContextSchema = {
            slots: [{ id: 'scanPdf', kind: 'file', label: 'Scan' }],
        };
        const stepBindings: FlowStepBindings = {
            'hash-file': { source: 'scanPdf' },
        };
        const html = renderToStaticMarkup(
            withAppProviders(
                <FlowContextProvider
                    flowId="story-extract"
                    schema={schema}
                    stepBindings={stepBindings}
                    initialSlots={{
                        scanPdf: {
                            kind: 'file',
                            file,
                            name: 'scan.pdf',
                            byteSize: file.size,
                        },
                    }}
                >
                    <ExtractToolShell
                        tool={stubTool('hash-file', { entry: 'file' })}
                        extract={() => []}
                        mode="file"
                    />
                </FlowContextProvider>,
            ),
        );
        expect(html).toContain('Aus Vorhaben: scan.pdf');
        expect(html).toContain('data-testid="flow-bound-chip"');
        expect(html).not.toContain('data-testid="extract-file-input"');
        expect(html).not.toContain('type="file"');
    });

    test('without provider → file input visible', () => {
        const html = renderToStaticMarkup(
            withAppProviders(
                <ExtractToolShell
                    tool={stubTool('hash-file', { entry: 'file' })}
                    extract={() => []}
                    mode="file"
                />,
            ),
        );
        expect(html).toContain('data-testid="extract-file-input"');
        expect(html).toContain('type="file"');
        expect(html).not.toContain('Aus Vorhaben:');
    });
});

describe('shell contract: FilePipelineToolShell', () => {
    test('filled file binding → dropzone hidden, Chip visible', () => {
        const file = new File(['img'], 'foto.png', { type: 'image/png' });
        const schema: FlowContextSchema = {
            slots: [{ id: 'photo', kind: 'image', label: 'Foto' }],
        };
        const stepBindings: FlowStepBindings = {
            'img-pipeline': { file: 'photo' },
        };
        const html = renderToStaticMarkup(
            <FlowContextProvider
                flowId="story-pipeline"
                schema={schema}
                stepBindings={stepBindings}
                initialSlots={{
                    photo: {
                        kind: 'image',
                        file,
                        name: 'foto.png',
                        byteSize: file.size,
                    },
                }}
            >
                <FilePipelineToolShell
                    tool={stubTool('img-pipeline')}
                    fileInputKey="file"
                    dropzone={<div data-testid="fake-dropzone">Drop</div>}
                />
            </FlowContextProvider>,
        );
        expect(html).toContain('Aus Vorhaben: foto.png');
        expect(html).toContain('data-testid="flow-bound-chip"');
        expect(html).not.toContain('data-testid="fake-dropzone"');
        expect(html).not.toContain('data-testid="file-pipeline-dropzone"');
    });

    test('without provider → dropzone visible', () => {
        const html = renderToStaticMarkup(
            <FilePipelineToolShell
                tool={stubTool('img-pipeline')}
                dropzone={<div data-testid="fake-dropzone">Drop</div>}
            />,
        );
        expect(html).toContain('data-testid="fake-dropzone"');
        expect(html).toContain('data-testid="file-pipeline-dropzone"');
        expect(html).not.toContain('Aus Vorhaben:');
    });
});

describe('shell contract: EditorToolShell', () => {
    test('filled file binding → dropzone hidden, Chip visible', () => {
        const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
        const schema: FlowContextSchema = {
            slots: [{ id: 'pdf', kind: 'file', label: 'PDF' }],
        };
        const stepBindings: FlowStepBindings = {
            'pdf-edit': { file: 'pdf' },
        };
        const html = renderToStaticMarkup(
            <FlowContextProvider
                flowId="story-editor"
                schema={schema}
                stepBindings={stepBindings}
                initialSlots={{
                    pdf: { kind: 'file', file, name: 'doc.pdf', byteSize: file.size },
                }}
            >
                <EditorToolShell
                    tool={stubTool('pdf-edit')}
                    fileInputKey="file"
                    dropzone={<div data-testid="editor-upload">Upload</div>}
                >
                    <div>canvas</div>
                </EditorToolShell>
            </FlowContextProvider>,
        );
        expect(html).toContain('Aus Vorhaben: doc.pdf');
        expect(html).toContain('data-testid="flow-bound-chip"');
        expect(html).not.toContain('data-testid="editor-upload"');
    });
});

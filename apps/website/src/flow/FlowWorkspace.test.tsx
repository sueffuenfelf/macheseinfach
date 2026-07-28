import { describe, expect, test } from 'bun:test';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FlowContextSchema, FlowDefinition, FlowStepBindings } from '../data/catalog/types';
import { FlowContextBar } from './FlowContextBar';
import { FlowContextProvider } from './FlowContextProvider';
import { FlowContinueFooter } from './FlowContinueFooter';
import { FlowStepRail } from './FlowStepRail';

function wrap(
    schema: FlowContextSchema,
    stepBindings: FlowStepBindings,
    node: ReactNode,
    initialSlots?: Record<string, import('./context-types').FlowSlotValue>,
) {
    return renderToStaticMarkup(
        <FlowContextProvider
            flowId="story-test-workspace"
            schema={schema}
            stepBindings={stepBindings}
            initialSlots={initialSlots}
        >
            {node}
        </FlowContextProvider>,
    );
}

const schema: FlowContextSchema = {
    slots: [
        { id: 'iban', kind: 'iban', label: 'IBAN', required: true },
        { id: 'secret', kind: 'password', label: 'Passwort', persist: 'never' },
    ],
};

const flow: FlowDefinition = {
    id: 'story-iban-vor-ueberweisung',
    slug: 'iban-pruefen',
    areaIds: ['buchhaltung'],
    role: 'Test',
    want: 'test',
    title: 'Test',
    situation: 'Sit',
    outcome: 'IBAN prüfen',
    status: 'ready',
    steps: [
        { toolId: 'iban-validate', label: 'IBAN prüfen' },
        { toolId: 'girocode-gen', label: 'GiroCode' },
    ],
    recommended: [{ toolId: 'pdf-compress', reason: 'PDF danach' }],
    context: schema,
    stepBindings: { 'iban-validate': { iban: 'iban' } },
};

describe('FlowContextBar', () => {
    test('shows trust copy and soft-warn for empty required', () => {
        const html = wrap(
            schema,
            {},
            <FlowContextBar flowTitle="Test" onRequestClear={() => {}} />,
        );
        expect(html).toContain('Alles bleibt lokal in diesem Tab');
        expect(html).toContain('flow-soft-warn');
        expect(html).toContain('IBAN');
        expect(html).toContain('wird nicht gespeichert');
    });

    test('filled required clears soft-warn; password never shows cleartext', () => {
        const html = wrap(
            schema,
            {},
            <FlowContextBar flowTitle="Test" onRequestClear={() => {}} />,
            {
                iban: { kind: 'iban', value: 'DE89370400440532013000' },
                secret: { kind: 'password', value: 's3cret' },
            },
        );
        expect(html).not.toContain('flow-soft-warn');
        expect(html).toContain('••••••••');
        expect(html).not.toContain('s3cret');
        expect(html).toContain('Im Vorhaben: DE89370400440532013000');
    });
});

describe('FlowStepRail', () => {
    test('renders required steps and recommended secondary', () => {
        const html = renderToStaticMarkup(
            <FlowStepRail
                flow={flow}
                activeToolId="iban-validate"
                successToolIds={new Set()}
                onSelectTool={() => {}}
            />,
        );
        expect(html).toContain('flow-step-rail');
        expect(html).toContain('IBAN prüfen');
        expect(html).toContain('Auch interessant');
        expect(html).toContain('flow-recommended');
        expect(html).toContain('GiroCode');
    });
});

describe('FlowContinueFooter', () => {
    test('disables continue when required slot empty', () => {
        const html = wrap(
            schema,
            {},
            <FlowContinueFooter
                flow={flow}
                activeToolId="iban-validate"
                successToolIds={new Set(['iban-validate'])}
                onContinue={() => {}}
            />,
        );
        expect(html).toContain('flow-continue-footer');
        expect(html).toContain('Zuerst IBAN');
        expect(html).toContain('disabled');
    });

    test('shows Weiter label when context ready', () => {
        const html = wrap(
            schema,
            {},
            <FlowContinueFooter
                flow={flow}
                activeToolId="iban-validate"
                successToolIds={new Set(['iban-validate'])}
                onContinue={() => {}}
            />,
            { iban: { kind: 'iban', value: 'DE89' } },
        );
        expect(html).toContain('Weiter: GiroCode');
        expect(html).not.toContain('Zuerst IBAN');
    });
});

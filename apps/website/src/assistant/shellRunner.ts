import type { ToolRunResult } from '@macheseinfach/assistant-core';
import { getTool } from '../data/catalog';
import { getToolShellRuntime } from '../tools/discover';
import { defaultsFromFields } from '../tools/_shared/shells';
import type {
    CalcResult,
    CheckResult,
    ExtractField,
    FieldDef,
    FieldValues,
    GenerateOutput,
    PasteFinding,
} from '../tools/_shared/shells';
import type { ToolShellRuntime } from '../tools/shell-runtime';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function inputToFieldValues(
    fields: readonly FieldDef[],
    input: Record<string, unknown>,
): FieldValues {
    const values = defaultsFromFields(fields);
    for (const field of fields) {
        const raw = input[field.id];
        if (raw === undefined || raw === null) continue;
        values[field.id] = typeof raw === 'string' ? raw : String(raw);
    }
    return values;
}

function formatCalcSummary(result: CalcResult): string {
    if (result.error) return result.error;
    const parts = result.rows.map((row) => `${row.label}: ${String(row.value)}`);
    return [result.heading, ...parts].filter(Boolean).join(' · ');
}

function formatCheckSummary(result: CheckResult): string {
    return (
        result.summary ??
        result.heading ??
        (result.ok ? 'Prüfung bestanden.' : 'Prüfung fehlgeschlagen.')
    );
}

function formatGenerateSummary(output: GenerateOutput): string {
    if (!output) return 'Keine Ausgabe erzeugt.';
    if (output.kind === 'qr') return 'QR-Code erzeugt.';
    const preview = output.content.slice(0, 120);
    return preview.length < output.content.length ? `${preview}…` : preview;
}

function formatPasteSummary(findings: PasteFinding[]): string {
    if (!findings.length) return 'Keine Auffälligkeiten gefunden.';
    const first = findings[0];
    return findings.length === 1
        ? first.title
        : `${findings.length} Hinweise — zuerst: ${first.title}`;
}

function formatExtractSummary(fields: ExtractField[]): string {
    if (!fields.length) return 'Keine Felder extrahiert.';
    const first = fields[0];
    const preview = first.value.length > 80 ? `${first.value.slice(0, 77)}…` : first.value;
    return fields.length === 1
        ? `${first.label}: ${preview}`
        : `${fields.length} Felder — zuerst ${first.label}: ${preview}`;
}

async function runShellRuntime(
    shell: ToolShellRuntime,
    input: Record<string, unknown>,
): Promise<ToolRunResult> {
    switch (shell.kind) {
        case 'calc': {
            const values = inputToFieldValues(shell.fields, input);
            const result = shell.compute(values);
            return {
                ok: !result.error,
                summary: formatCalcSummary(result),
                output: result,
                error: result.error,
            };
        }
        case 'check': {
            const values = inputToFieldValues(shell.fields, input);
            const result = await shell.check(values);
            return {
                ok: result.ok,
                summary: formatCheckSummary(result),
                output: result,
            };
        }
        case 'generate': {
            const values = inputToFieldValues(shell.fields, input);
            if (shell.isReady && !shell.isReady(values)) {
                return {
                    ok: false,
                    error: 'Eingaben unvollständig für die Generierung.',
                    summary: 'Bitte alle Pflichtfelder ausfüllen.',
                };
            }
            const output = await shell.generate(values);
            if (!output) {
                return {
                    ok: false,
                    error: 'Keine Ausgabe erzeugt.',
                    summary: 'Generierung lieferte kein Ergebnis.',
                };
            }
            return {
                ok: true,
                summary: formatGenerateSummary(output),
                output,
            };
        }
        case 'paste': {
            const text =
                typeof input.text === 'string'
                    ? input.text
                    : typeof input.paste === 'string'
                      ? input.paste
                      : typeof input.input === 'string'
                        ? input.input
                        : '';
            if (!text.trim()) {
                return {
                    ok: false,
                    error: 'Text fehlt.',
                    summary: 'Bitte Text unter input.text oder input.paste übergeben.',
                };
            }
            const findings = await shell.analyze(text);
            return {
                ok: true,
                summary: formatPasteSummary(findings),
                output: { findings },
            };
        }
        case 'extract': {
            const text =
                typeof input.text === 'string'
                    ? input.text
                    : typeof input.paste === 'string'
                      ? input.paste
                      : undefined;
            const file = input.file instanceof File ? input.file : undefined;
            const mode = shell.mode ?? 'both';

            if (mode === 'file' && !file) {
                return {
                    ok: false,
                    error: 'Datei fehlt.',
                    summary: 'Bitte input.file als Anhang oder File übergeben.',
                };
            }
            if (mode === 'text' && !text?.trim()) {
                return {
                    ok: false,
                    error: 'Text fehlt.',
                    summary: 'Bitte input.text übergeben.',
                };
            }
            if (mode === 'both' && !file && !text?.trim()) {
                return {
                    ok: false,
                    error: 'Eingabe fehlt.',
                    summary: 'Bitte input.file oder input.text übergeben.',
                };
            }

            const fields = await shell.extract({
                text: text?.trim() || undefined,
                file,
            });
            return {
                ok: true,
                summary: formatExtractSummary(fields),
                output: { fields },
            };
        }
        default:
            return {
                ok: false,
                error: 'Unbekannter Shell-Typ.',
                summary: 'Tool konnte nicht ausgeführt werden.',
            };
    }
}

function runBespokeTool(_toolId: string, _input: Record<string, unknown>): ToolRunResult | null {
    return null;
}

export function isFileEntryTool(toolId: string): boolean {
    const tool = getTool(toolId);
    if (!tool) return false;
    return tool.entry === 'file' || tool.entry === 'file-or-form';
}

export async function runCatalogTool(toolId: string, input: unknown): Promise<ToolRunResult> {
    const tool = getTool(toolId);
    if (!tool) {
        return {
            ok: false,
            error: `Unbekanntes Tool: ${toolId}`,
            summary: 'Tool-ID nicht im Katalog gefunden.',
        };
    }

    if (!isRecord(input)) {
        return {
            ok: false,
            error: 'input muss ein JSON-Objekt sein.',
            summary: 'Ungültige Eingabe für run_tool.',
        };
    }

    const bespoke = runBespokeTool(toolId, input);
    if (bespoke) return bespoke;

    const shell = getToolShellRuntime(toolId);
    if (shell) {
        return runShellRuntime(shell, input);
    }

    if (isFileEntryTool(toolId)) {
        return {
            ok: false,
            error: 'Datei-Tool — bitte openInUi: true verwenden.',
            summary: `${tool.shortTitle} öffnet die Tool-Oberfläche für Dateien.`,
        };
    }

    return {
        ok: false,
        error: 'Headless-Ausführung nicht verfügbar.',
        summary: `Nutze openInUi: true für ${tool.shortTitle}.`,
    };
}

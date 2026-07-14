export type CommandStatus = 'success' | 'error' | 'info';

export type CommandResult = {
    status: CommandStatus;
    /** Primary output shown in the palette */
    output: string;
    /** Text copied to clipboard on execute (defaults to output) */
    copyText?: string;
    /** Optional QR or image preview */
    imageDataUrl?: string;
    /** Short label for inline feedback, e.g. "Kopiert" */
    feedback?: string;
};

export type SlashCommand = {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    execute: (args: string) => Promise<CommandResult> | CommandResult;
};

export type ParsedSlashInput = {
    commandName: string;
    args: string;
};

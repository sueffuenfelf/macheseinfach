type InlineToken =
    | { type: 'text'; value: string }
    | { type: 'code'; value: string }
    | { type: 'bold'; value: string }
    | { type: 'italic'; value: string }
    | { type: 'link'; label: string; href: string };

function parseInline(text: string): InlineToken[] {
    const tokens: InlineToken[] = [];
    const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g;
    let last = 0;
    let match = pattern.exec(text);
    while (match !== null) {
        if (match.index > last) {
            tokens.push({ type: 'text', value: text.slice(last, match.index) });
        }
        const [full, code, bold, italic, , href] = match;
        if (code) {
            tokens.push({ type: 'code', value: code.slice(1, -1) });
        } else if (bold) {
            tokens.push({ type: 'bold', value: bold.slice(2, -2) });
        } else if (italic) {
            tokens.push({ type: 'italic', value: italic.slice(1, -1) });
        } else if (href) {
            const label = full.slice(1, full.indexOf(']'));
            tokens.push({ type: 'link', label, href });
        }
        last = match.index + full.length;
        match = pattern.exec(text);
    }
    if (last < text.length) {
        tokens.push({ type: 'text', value: text.slice(last) });
    }
    return tokens;
}

function Inline({ text }: { text: string }) {
    return (
        <>
            {parseInline(text).map((token, i) => {
                const key = `${token.type}-${i}`;
                if (token.type === 'code') {
                    return (
                        <code
                            key={key}
                            className="rounded-[4px] border border-black/20 bg-[var(--color-chip)] px-1 py-0.5 font-mono text-[12px]"
                        >
                            {token.value}
                        </code>
                    );
                }
                if (token.type === 'bold') {
                    return (
                        <strong key={key} className="font-semibold">
                            {token.value}
                        </strong>
                    );
                }
                if (token.type === 'italic') {
                    return <em key={key}>{token.value}</em>;
                }
                if (token.type === 'link') {
                    return (
                        <a
                            key={key}
                            href={token.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="font-semibold underline decoration-[var(--color-line)] underline-offset-2"
                        >
                            {token.label}
                        </a>
                    );
                }
                return <span key={key}>{token.value}</span>;
            })}
        </>
    );
}

type Block =
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; level: 1 | 2 | 3; text: string }
    | { type: 'list'; ordered: boolean; items: string[] }
    | { type: 'code'; text: string }
    | { type: 'quote'; text: string };

function parseBlocks(markdown: string): Block[] {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i] ?? '';

        if (!line.trim()) {
            i += 1;
            continue;
        }

        if (line.startsWith('```')) {
            const body: string[] = [];
            i += 1;
            while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
                body.push(lines[i] ?? '');
                i += 1;
            }
            i += 1;
            blocks.push({ type: 'code', text: body.join('\n') });
            continue;
        }

        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
            const hashes = heading[1] ?? '#';
            const text = heading[2] ?? '';
            const level = Math.min(3, Math.max(1, hashes.length)) as 1 | 2 | 3;
            blocks.push({
                type: 'heading',
                level,
                text,
            });
            i += 1;
            continue;
        }

        if (/^>\s?/.test(line)) {
            const quoteLines: string[] = [];
            while (i < lines.length && /^>\s?/.test(lines[i] ?? '')) {
                quoteLines.push((lines[i] ?? '').replace(/^>\s?/, ''));
                i += 1;
            }
            blocks.push({ type: 'quote', text: quoteLines.join(' ') });
            continue;
        }

        if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            const ordered = /^\d+\.\s+/.test(line);
            const items: string[] = [];
            while (
                i < lines.length &&
                (ordered ? /^\d+\.\s+/.test(lines[i] ?? '') : /^[-*]\s+/.test(lines[i] ?? ''))
            ) {
                items.push((lines[i] ?? '').replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''));
                i += 1;
            }
            blocks.push({ type: 'list', ordered, items });
            continue;
        }

        const para: string[] = [line];
        i += 1;
        while (
            i < lines.length &&
            (lines[i] ?? '').trim() &&
            !/^(#{1,3})\s+/.test(lines[i] ?? '') &&
            !/^```/.test(lines[i] ?? '') &&
            !/^>\s?/.test(lines[i] ?? '') &&
            !/^[-*]\s+/.test(lines[i] ?? '') &&
            !/^\d+\.\s+/.test(lines[i] ?? '')
        ) {
            para.push(lines[i] ?? '');
            i += 1;
        }
        blocks.push({ type: 'paragraph', text: para.join(' ') });
    }

    return blocks;
}

export function AssistantMarkdown({ content }: { content: string }) {
    const blocks = parseBlocks(content);
    if (!blocks.length) {
        return <span className="whitespace-pre-wrap">{content}</span>;
    }

    return (
        <div className="space-y-2 [&_p]:m-0">
            {blocks.map((block, index) => {
                const key = `${block.type}-${index}`;
                if (block.type === 'heading') {
                    const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
                    const size =
                        block.level === 1
                            ? 'text-[16px]'
                            : block.level === 2
                              ? 'text-[15px]'
                              : 'text-[14px]';
                    return (
                        <Tag
                            key={key}
                            className={`font-display font-bold tracking-[-0.01em] ${size}`}
                        >
                            <Inline text={block.text} />
                        </Tag>
                    );
                }
                if (block.type === 'code') {
                    return (
                        <pre
                            key={key}
                            className="overflow-x-auto rounded-[8px] border-2 border-black bg-[var(--color-chip)] p-2 font-mono text-[12px] leading-relaxed"
                        >
                            <code>{block.text}</code>
                        </pre>
                    );
                }
                if (block.type === 'quote') {
                    return (
                        <blockquote
                            key={key}
                            className="border-l-4 border-black pl-3 text-[13px] text-[var(--color-ink-soft)]"
                        >
                            <Inline text={block.text} />
                        </blockquote>
                    );
                }
                if (block.type === 'list') {
                    const ListTag = block.ordered ? 'ol' : 'ul';
                    return (
                        <ListTag
                            key={key}
                            className={`ml-4 space-y-1 text-[14px] ${
                                block.ordered ? 'list-decimal' : 'list-disc'
                            }`}
                        >
                            {block.items.map((item) => (
                                <li key={`${key}:${item}`}>
                                    <Inline text={item} />
                                </li>
                            ))}
                        </ListTag>
                    );
                }
                return (
                    <p key={key} className="whitespace-pre-wrap text-[14px] leading-relaxed">
                        <Inline text={block.text} />
                    </p>
                );
            })}
        </div>
    );
}

/** Exported for unit tests. */
export function __parseAssistantMarkdownForTests(content: string): Block[] {
    return parseBlocks(content);
}

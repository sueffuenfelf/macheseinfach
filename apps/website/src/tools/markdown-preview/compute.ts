import type { FieldValues, GenerateOutput } from '../_shared/shells';

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Minimal Markdown → HTML. All text is HTML-escaped first; only a safe tag
 * subset is introduced. No raw HTML from input is preserved (XSS-safe).
 */
export function markdownToSafeHtml(src: string): string {
    const lines = src.replace(/\r\n/g, '\n').split('\n');
    const out: string[] = [];
    let inCode = false;
    let codeBuf: string[] = [];
    let inList = false;

    const flushList = () => {
        if (inList) {
            out.push('</ul>');
            inList = false;
        }
    };

    const inline = (s: string): string => {
        let t = escapeHtml(s);
        t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
        t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        t = t.replace(
            /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
            '<a href="$2" rel="noopener noreferrer">$1</a>',
        );
        return t;
    };

    for (const line of lines) {
        if (line.trimStart().startsWith('```')) {
            if (inCode) {
                out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
                codeBuf = [];
                inCode = false;
            } else {
                flushList();
                inCode = true;
            }
            continue;
        }
        if (inCode) {
            codeBuf.push(line);
            continue;
        }

        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
            flushList();
            const level = heading[1].length;
            out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
            continue;
        }

        const li = /^[-*]\s+(.+)$/.exec(line);
        if (li) {
            if (!inList) {
                out.push('<ul>');
                inList = true;
            }
            out.push(`<li>${inline(li[1])}</li>`);
            continue;
        }

        if (line.trim() === '') {
            flushList();
            continue;
        }

        flushList();
        out.push(`<p>${inline(line)}</p>`);
    }

    if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
    }
    flushList();
    return out.join('\n');
}

export function generateMarkdownPreview(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text.trim()) return null;
    const html = markdownToSafeHtml(text);
    return {
        kind: 'code',
        content: html,
        language: 'html',
        filename: 'preview.html',
    };
}

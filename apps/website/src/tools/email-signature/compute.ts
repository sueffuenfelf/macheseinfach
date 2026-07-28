import type { FieldValues, GenerateOutput } from '../_shared/shells';

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function generateEmailSignature(values: FieldValues): GenerateOutput {
    const name = (values.name ?? '').trim();
    if (!name) return null;

    const title = (values.title ?? '').trim();
    const company = (values.company ?? '').trim();
    const phone = (values.phone ?? '').trim();
    const email = (values.email ?? '').trim();
    const website = (values.website ?? '').trim();

    const lines: string[] = [];
    lines.push(`<div style="font-family:Arial,sans-serif;font-size:14px;color:#000;">`);
    lines.push(`<strong>${escapeHtml(name)}</strong><br>`);
    if (title) lines.push(`${escapeHtml(title)}<br>`);
    if (company) lines.push(`${escapeHtml(company)}<br>`);
    if (phone) lines.push(`Tel.: <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a><br>`);
    if (email) lines.push(`E-Mail: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>`);
    if (website) {
        const href = website.startsWith('http') ? website : `https://${website}`;
        lines.push(`Web: <a href="${escapeHtml(href)}">${escapeHtml(website)}</a><br>`);
    }
    lines.push('</div>');

    return {
        kind: 'code',
        content: lines.join('\n'),
        language: 'html',
        filename: 'email-signatur.html',
    };
}

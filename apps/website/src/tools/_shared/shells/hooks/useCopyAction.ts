import { copyToClipboard, downloadDataUrl, downloadText } from '../../../../lib/format';
import { useToast } from '../../../../shell/toast';

/** Clipboard + download helpers with German toast copy. */
export function useCopyAction() {
    const { toast } = useToast();

    async function copyText(text: string, successMessage = 'Kopiert.') {
        const ok = await copyToClipboard(text);
        if (ok) {
            toast({ message: successMessage, variant: 'success' });
            return true;
        }
        toast({ message: 'Kopieren war leider nicht möglich.', variant: 'error' });
        return false;
    }

    function downloadAsText(
        text: string,
        filename: string,
        successMessage = 'Download gestartet.',
    ) {
        downloadText(text, filename);
        toast({ message: successMessage, variant: 'success' });
    }

    function downloadAsDataUrl(
        dataUrl: string,
        filename: string,
        successMessage = 'Download gestartet.',
    ) {
        downloadDataUrl(dataUrl, filename);
        toast({ message: successMessage, variant: 'success' });
    }

    return { copyText, downloadAsText, downloadAsDataUrl };
}

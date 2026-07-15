import { useEffect, useState } from 'react';
import { generatePassword } from '../../../shell/commands/utils';
import { DEFAULT_WIDGET_PASSWORD_OPTIONS } from '../../../shell/workspaces/password-options';
import { PasswordCharTypesInline } from '../../../shell/widgets/WidgetSettingsPopover';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 48;

function clampPasswordLength(value: number): number {
    return Math.min(PASSWORD_MAX_LENGTH, Math.max(PASSWORD_MIN_LENGTH, value));
}

export function PasswordMiniWidget({
    embedded,
    passwordOptions: passwordOptionsProp,
    onPasswordOptionsChange,
}: WidgetComponentProps) {
    const passwordOptions = passwordOptionsProp ?? DEFAULT_WIDGET_PASSWORD_OPTIONS;
    const [password, setPassword] = useState(() =>
        generatePassword(passwordOptions.length, passwordOptions),
    );
    const [copied, setCopied] = useState(false);

    const { length } = passwordOptions;

    useEffect(() => {
        setPassword(generatePassword(passwordOptions.length, passwordOptions));
    }, [
        passwordOptions.length,
        passwordOptions.uppercase,
        passwordOptions.lowercase,
        passwordOptions.numbers,
        passwordOptions.symbols,
    ]);

    function setLengthClamped(value: number) {
        onPasswordOptionsChange?.({
            ...passwordOptions,
            length: clampPasswordLength(value),
        });
    }

    function regenerate() {
        setPassword(generatePassword(passwordOptions.length, passwordOptions));
    }

    async function copyPassword() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            // Ignore clipboard permission failures.
        }
    }

    return (
        <WidgetCard title="Passwort Generator" embedded={embedded}>
            <div className="widget-password">
                <div className="widget-password__main">
                    <div className="widget-password__controls">
                        <div className="widget-password__stepper">
                            <span className="widget-password__label widget-password__label--decorative">
                                Länge
                            </span>
                            <div className="widget-password__stepper-group">
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Passwort kürzer"
                                    disabled={length <= PASSWORD_MIN_LENGTH}
                                    onClick={() => setLengthClamped(length - 1)}
                                >
                                    −
                                </button>
                                <span className="widget-password__value" aria-live="polite">
                                    {length}
                                </span>
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Passwort länger"
                                    disabled={length >= PASSWORD_MAX_LENGTH}
                                    onClick={() => setLengthClamped(length + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="widget-password__generate ms-btn"
                            aria-label="Neues Passwort generieren"
                            onClick={() => regenerate()}
                        >
                            <span className="widget-password__generate-label widget-password__generate-label--full">
                                Neu
                            </span>
                            <span
                                className="widget-password__generate-label widget-password__generate-label--short"
                                aria-hidden
                            >
                                ↻
                            </span>
                        </button>
                    </div>
                    {onPasswordOptionsChange ? (
                        <PasswordCharTypesInline
                            options={passwordOptions}
                            onChange={onPasswordOptionsChange}
                        />
                    ) : null}
                    <button
                        type="button"
                        className="widget-password__output ms-focus"
                        onClick={() => void copyPassword()}
                        title={copied ? 'Kopiert!' : 'Klicken zum Kopieren'}
                        aria-label={copied ? 'Passwort kopiert' : 'Passwort kopieren'}
                    >
                        <span className="widget-password__output-text">{password}</span>
                        <span className="widget-password__copy-hint" aria-hidden>
                            {copied ? '✓' : '⎘'}
                        </span>
                    </button>
                </div>
            </div>
        </WidgetCard>
    );
}

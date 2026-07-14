type SettingsToggleRowProps = {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
};

export function SettingsToggleRow({
    title,
    description,
    checked,
    onChange,
    disabled = false,
    id,
}: SettingsToggleRowProps) {
    const switchId = id ?? title;

    return (
        <div className={`ms-settings-row ${disabled ? 'ms-settings-row--disabled' : ''}`}>
            <div className="ms-settings-row__label-group">
                <span className="ms-settings-row__title" id={`${switchId}-label`}>
                    {title}
                </span>
                <span className="ms-info-tip">
                    <button
                        type="button"
                        className="ms-info-tip__trigger"
                        aria-label={`Info: ${title}`}
                        aria-describedby={`${switchId}-desc`}
                        tabIndex={0}
                    >
                        i
                    </button>
                    <span id={`${switchId}-desc`} role="tooltip" className="ms-info-tip__bubble">
                        {description}
                    </span>
                </span>
            </div>
            <button
                type="button"
                role="switch"
                id={switchId}
                className="ms-settings-toggle"
                aria-checked={checked}
                aria-labelledby={`${switchId}-label`}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                        event.preventDefault();
                        if (!disabled) onChange(!checked);
                    }
                }}
            >
                <span className="ms-settings-toggle__track" aria-hidden>
                    <span className="ms-settings-toggle__thumb" />
                </span>
            </button>
        </div>
    );
}

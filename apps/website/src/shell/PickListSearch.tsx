import { useId } from 'react';

type PickListSearchProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    /** Flush inside a list card (no outer radius/shadow). */
    attached?: boolean;
};

export function PickListSearch({
    value,
    onChange,
    onSubmit,
    placeholder = 'Volltextsuche …',
    attached = false,
}: PickListSearchProps) {
    const inputId = useId();

    return (
        <div className={`pick-list-search ${attached ? 'pick-list-search--attached' : ''}`}>
            <label htmlFor={inputId} className="pick-list-search__label">
                Suchen
            </label>
            <input
                id={inputId}
                type="search"
                enterKeyHint="go"
                className="ms-input pick-list-search__input ms-focus"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        onSubmit();
                    }
                }}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
            />
        </div>
    );
}

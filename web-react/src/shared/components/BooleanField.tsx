import './BooleanField.css';

interface BooleanFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    onText?: string;
    offText?: string;
    label?: string;
    disabled?: boolean;
}

export function BooleanField({
                                 value,
                                 onChange,
                                 onText = 'Sim',
                                 offText = 'Não',
                                 label,
                                 disabled = false,
                             }: BooleanFieldProps) {
    return (
        <div className={`boolean-field ${disabled ? 'boolean-field-disabled' : ''}`}>
            <button
                type="button"
                className={`boolean-field-toggle ${value ? 'boolean-field-toggle-on' : ''}`}
                disabled={disabled}
                aria-pressed={value}
                onClick={() => onChange(!value)}
            >
                <span className="boolean-field-toggle-text">{value ? onText : offText}</span>
            </button>
            {label && <span className="boolean-field-label">{label}</span>}
        </div>
    );
}
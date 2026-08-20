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
        <label className={`boolean-field ${disabled ? 'boolean-field-disabled' : ''}`}>
            <input
                type="checkbox"
                className="boolean-field-input"
                checked={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className="boolean-field-track" aria-hidden="true">
        <span className="boolean-field-thumb"/>
      </span>
            <span className="boolean-field-text">{value ? onText : offText}</span>
            {label && <span className="boolean-field-label">{label}</span>}
        </label>
    );
}

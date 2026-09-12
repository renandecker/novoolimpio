import {ReactNode, useEffect, useState} from 'react';
import {Tabs} from './Tabs';
import type {TabItem} from './Tabs';

export interface FormTabConfig {
    key: string;
    label: string;
    fields?: FormFieldConfig[];
    content?: ReactNode;
}

export interface FormFieldConfig {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'mask' | 'autoComplete';
    required?: boolean;
    placeholder?: string;
    mask?: string;
    options?: Array<{value: string; label: string}>;
    span?: 1 | 2 | 3 | 4;
    autoCompleteSource?: string;
    autoCompleteSearchKeys?: string[];
    autoCompleteColumns?: any[];
    readOnly?: boolean;
}

export interface FormLayoutProps {
    title: string;
    tabs: FormTabConfig[];
    initialValues?: Record<string, unknown>;
    onSubmit: (values: Record<string, unknown>) => void;
    onCancel: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    saving?: boolean;
    error?: string;
    className?: string;
    children?: ReactNode;
}

export function FormLayout({
    title,
    tabs,
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Salvar',
    cancelLabel = 'Voltar',
    saving = false,
    error,
    className = '',
    children,
}: FormLayoutProps) {
    const [values, setValues] = useState<Record<string, unknown>>(initialValues);

    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setValues((prev) => ({...prev, ...initialValues}));
        }
    }, [initialValues]);

    const handleChange = (name: string, value: unknown) => {
        setValues((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = () => {
        onSubmit(values);
    };

    const tabItems: TabItem[] = tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: tab.content ?? (
            <div className="form-grid">
                {(tab.fields ?? []).map((field) => (
                    <label key={field.name} className="form-field">
                        <span className="form-label">
                            {field.label} {field.required && <span style={{color: '#C90000', marginLeft: '2px'}}>*</span>}
                        </span>
                        {renderField(field, handleChange, values[field.name])}
                    </label>
                ))}
            </div>
        ),
    }));

    return (
        <div className={`form-layout ${className}`}>
            <div className="page-header">
                <div className="page-header-breadcrumb">
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <div className="breadcrumb-group">
                            <span className="breadcrumb-item breadcrumb-current">{title}</span>
                        </div>
                    </nav>
                </div>
            </div>

            {error && <div className="form-erro">{error}</div>}

            <Tabs tabs={tabItems} initial={tabs[0]?.key} className="form-tabs"/>

            <div className="form-footer">
                <button type="button" className="btn-form-back btnyellow" onClick={onCancel} disabled={saving}>
                    {cancelLabel}
                </button>
                <button type="button" className="btn-form-save btnstop" onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Salvando...' : submitLabel}
                </button>
            </div>

            {children}
        </div>
    );
}

function renderField(field: FormFieldConfig, onChange: (name: string, value: unknown) => void, value: unknown) {
    const currentValue = value ?? '';
    const fullRow = field.type === 'textarea' || field.span === 3 || field.span === 4;
    const gridColumnStyle = fullRow ? {gridColumn: 'span 3'} : undefined;

    switch (field.type) {
        case 'select':
            return (
                <select
                    className="form-input form-select"
                    style={gridColumnStyle}
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    readOnly={field.readOnly}
                >
                    <option value="">-- Selecione --</option>
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );

        case 'textarea':
            return (
                <textarea
                    className="form-input"
                    style={{minHeight: '80px', resize: 'vertical', ...gridColumnStyle}}
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                />
            );

        case 'date':
            return (
                <input
                    className="form-input"
                    style={gridColumnStyle}
                    type="date"
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    readOnly={field.readOnly}
                />
            );

        case 'number':
            return (
                <input
                    className="form-input"
                    style={gridColumnStyle}
                    type="number"
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                />
            );

        case 'email':
            return (
                <input
                    className="form-input"
                    style={gridColumnStyle}
                    type="email"
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                />
            );

        case 'mask':
            return (
                <input
                    className="form-input"
                    style={gridColumnStyle}
                    type="text"
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder ?? field.mask}
                    readOnly={field.readOnly}
                    data-mask={field.mask}
                />
            );

        case 'autoComplete':
            return (
                <div className="auto-complete-wrapper" style={gridColumnStyle}>
                    <input
                        className="form-input"
                        type="text"
                        value={String(currentValue)}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                    />
                    {field.autoCompleteSource && (
                        <small style={{color: '#666', fontSize: '11px', marginTop: '4px', display: 'block'}}>
                            AutoComplete: {field.autoCompleteSource}
                        </small>
                    )}
                </div>
            );

        default:
            return (
                <input
                    className="form-input"
                    style={gridColumnStyle}
                    type="text"
                    value={String(currentValue)}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                />
            );
    }
}

import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';

interface ExportOption {
    key: string;
    label: string;
    icon: ReactNode;
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

interface ExportDropdownProps {
    options: ExportOption[];
    triggerLabel?: string;
    triggerIcon?: ReactNode;
    triggerClassName?: string;
}

export function ExportDropdown({options, triggerLabel = 'Exportar', triggerIcon, triggerClassName = 'btnyellow'}: ExportDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    if (options.length === 0) return null;

    return (
        <div className="export-dropdown" ref={ref} style={{display: 'inline-block', verticalAlign: 'middle'}}>
            <button
                type="button"
                className={`export-dropdown-trigger ${triggerClassName}`}
                title={triggerLabel}
                onClick={() => setOpen((prev) => !prev)}
                style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px'}}
            >
                {triggerIcon}
                <span>{triggerLabel}</span>
                <i className="fa fa-caret-down" style={{fontSize: '10px', marginLeft: '4px'}}/>
            </button>
            {open && (
                <div className="export-dropdown-list" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    minWidth: '160px',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {options.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`export-dropdown-item ${option.className ?? ''}`}
                            disabled={option.disabled}
                            onClick={() => {
                                setOpen(false);
                                option.onClick();
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: option.disabled ? 'not-allowed' : 'pointer',
                                color: option.disabled ? '#999' : '#333',
                                fontSize: '14px'
                            }}
                            onMouseOver={(e) => {
                                if (!option.disabled) e.currentTarget.style.background = '#f5f5f5';
                            }}
                            onMouseOut={(e) => {
                                if (!option.disabled) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {option.icon}
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';

export interface RowMenuItem {
    key: string;
    label: string;
    className?: string;
    disabled?: boolean;
    onSelect?: () => void;
}

interface RowMenuProps {
    icon: ReactNode;
    className: string;
    title?: string;
    items: RowMenuItem[];
}

/** Equivalent to <p:menuButton>…<p:menuitem/></p:menuButton>: a colored trigger that opens a
 * dropdown of colored items, used for the row-level action columns (Relatórios/Novo/Editar/Remover). */
export function RowMenu({icon, className, title, items}: RowMenuProps) {
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

    if (items.length === 0) return null;

    return (
        <div className="row-menu" ref={ref}>
            <button
                type="button"
                className={`row-menu-trigger ${className}`}
                title={title}
                onClick={() => setOpen((prev) => !prev)}
            >
                {icon}
            </button>
            {open && (
                <div className="row-menu-list">
                    {items.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`row-menu-item ${item.className ? ? ''}`}
                            disabled={item.disabled}
                            onClick={() => {
                                setOpen(false);
                                item.onSelect?.();
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

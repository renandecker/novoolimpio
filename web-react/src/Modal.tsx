import {ReactNode} from 'react';

export interface ModalProps {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
}

const SIZE_STYLES: Record<string, {maxWidth: string; minWidth?: string}> = {
    sm: {maxWidth: '400px'},
    md: {maxWidth: '600px'},
    lg: {maxWidth: '800px'},
    xl: {maxWidth: '1000px'},
    full: {maxWidth: '95vw', minWidth: '95vw'},
};

export function Modal({title, open, onClose, children, size = 'md', closeOnOverlayClick = true, showCloseButton = true}: ModalProps) {
    if (!open) return null;

    const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div
                className="modal"
                style={{maxWidth: sizeStyle.maxWidth, minWidth: sizeStyle.minWidth}}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 id="modal-title" className="modal-title">{title}</h2>
                    {showCloseButton && (
                        <button
                            type="button"
                            className="modal-close"
                            onClick={onClose}
                            aria-label="Fechar"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
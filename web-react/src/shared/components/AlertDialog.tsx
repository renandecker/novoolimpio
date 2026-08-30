import React, { createContext, useContext, useState, ReactNode } from 'react';

type AlertDialogOptions = {
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'alert' | 'confirm';
};

type AlertDialogContextType = {
    showAlert: (options: string | AlertDialogOptions) => Promise<boolean>;
};

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export function AlertDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<AlertDialogOptions>({ description: '' });
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const showAlert = (opts: string | AlertDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            const resolvedOptions: AlertDialogOptions = typeof opts === 'string'
                ? { description: opts, variant: 'alert', title: 'Aviso', confirmText: 'OK' }
                : {
                    title: opts.title || (opts.variant === 'confirm' ? 'Confirmação' : 'Aviso'),
                    confirmText: opts.confirmText || (opts.variant === 'confirm' ? 'Confirmar' : 'OK'),
                    cancelText: opts.cancelText || 'Cancelar',
                    variant: opts.variant || 'alert',
                    ...opts
                };

            setOptions(resolvedOptions);
            setIsOpen(true);
            setResolver(() => resolve);
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (options.onConfirm) options.onConfirm();
        if (resolver) resolver(true);
        setResolver(null);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (options.onCancel) options.onCancel();
        if (resolver) resolver(false);
        setResolver(null);
    };

    return (
        <AlertDialogContext.Provider value={{ showAlert }}>
            {children}
            {isOpen && (
                <div style={styles.overlay} onClick={handleCancel}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.header}>
                            <h3 style={styles.title}>{options.title || 'Aviso'}</h3>
                        </div>
                        <div style={styles.body}>
                            <p style={styles.description}>{options.description}</p>
                        </div>
                        <div style={styles.footer}>
                            {options.variant === 'confirm' && (
                                <button type="button" style={styles.cancelButton} onClick={handleCancel}>
                                    {options.cancelText || 'Cancelar'}
                                </button>
                            )}
                            <button type="button" style={styles.confirmButton} onClick={handleConfirm}>
                                {options.confirmText || 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AlertDialogContext.Provider>
    );
}

export const useAlertDialog = () => {
    const context = useContext(AlertDialogContext);
    if (!context) throw new Error('useAlertDialog must be used within an AlertDialogProvider');
    return context;
};

// Estilos dinâmicos baseados nas variáveis CSS do tema atual do sistema
const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease-out'
    },
    dialog: {
        backgroundColor: 'var(--cor-fundo, #ffffff)',
        color: 'var(--cor-texto, #222222)',
        borderRadius: '8px',
        border: 'var(--espessura-borda, 2px) solid var(--cor-borda-primaria, var(--cor-borda, #c2aa3c))',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s ease-out'
    },
    header: {
        padding: '16px 20px',
        background: 'linear-gradient(180deg, var(--cor-barra, #24272e) 0%, var(--cor-primaria, #2f333b) 100%)',
        borderBottom: '1px solid var(--cor-borda, #c2aa3c)',
        color: '#ffffff'
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
    },
    body: {
        padding: '20px',
        fontSize: '15px',
        lineHeight: '1.5'
    },
    description: {
        margin: 0,
        wordBreak: 'break-word'
    },
    footer: {
        padding: '12px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    confirmButton: {
        padding: '8px 18px',
        backgroundColor: 'var(--cor-destaque, var(--cor-secundaria, #3baae3))',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    cancelButton: {
        padding: '8px 18px',
        backgroundColor: 'transparent',
        color: 'var(--cor-texto, #333333)',
        border: '1px solid var(--cor-borda, #cccccc)',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};

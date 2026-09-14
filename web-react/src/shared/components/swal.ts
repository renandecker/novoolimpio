import Swal, { SweetAlertIcon } from 'sweetalert2';
import './sweetalert2-theme.css';

type AlertIcon = SweetAlertIcon;

const DEFAULT_TITLES: Record<Exclude<AlertIcon, 'warning'>, string> = {
    success: 'Sucesso!',
    error: 'Erro',
    info: 'Informação',
    question: 'Confirmação',
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export type AppConfirmOptions = {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: 'question' | 'warning';
    danger?: boolean;
};

const DEFAULT_CONFIRM_TEXT = 'Confirmar';
const DEFAULT_CANCEL_TEXT = 'Cancelar';

function fire(icon: AlertIcon, message?: string, title?: string) {
    return Swal.fire({
        icon,
        title: title || (icon === 'warning' ? 'Atenção' : DEFAULT_TITLES[icon]),
        html: message ? escapeHtml(message) : '',
        confirmButtonText: 'OK',
        buttonsStyling: false,
        heightAuto: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
    });
}

type AlertMethods = {
    success: (message?: string, title?: string) => Promise<unknown>;
    error: (message?: string, title?: string) => Promise<unknown>;
    warning: (message?: string, title?: string) => Promise<unknown>;
    info: (message?: string, title?: string) => Promise<unknown>;
    question: (message?: string, title?: string) => Promise<unknown>;
};

/** Alerta estilo SweetAlert2 no padrão visual do sistema Olímpio. */
export const appAlert: AlertMethods = {
    success: (message, title) => fire('success', message, title),
    error: (message, title) => fire('error', message, title),
    warning: (message, title) => fire('warning', message, title),
    info: (message, title) => fire('info', message, title),
    question: (message, title) => fire('question', message, title),
};

/** Substitui o window.alert — usado para manter todos os alert() com SweetAlert2. */
export function alertApp(message?: unknown): void {
    fire('info', String(message ?? ''));
}

/** Confirmação assíncrona estilo SweetAlert2. Resolve true em "Confirmar". */
export async function swalConfirm(
    message: string,
    options: AppConfirmOptions = {},
): Promise<boolean> {
    const result = await Swal.fire({
        icon: options.icon || 'question',
        title: options.title || 'Confirmação',
        html: escapeHtml(message),
        confirmButtonText: options.confirmText || DEFAULT_CONFIRM_TEXT,
        cancelButtonText: options.cancelText || DEFAULT_CANCEL_TEXT,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: options.danger ? { confirmButton: 'swal-destructive' } : undefined,
        heightAuto: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        reverseButtons: false,
    });
    return result.isConfirmed;
}

export { Swal };
export default Swal;
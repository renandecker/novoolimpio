import {api} from '../../shared/services/api';
import type {PagedResponse} from './types';

export type Notificacao = {
    id: number;
    username: string;
    titulo: string;
    mensagem: string | null;
    tipo: string | null;
    link: string | null;
    lida: boolean;
    canalSistema: boolean;
    canalMobile: boolean;
    canalEmail: boolean;
    emailEnviado: boolean;
    mobileEnviado: boolean;
    dataLeitura: string | null;
    createdAt: string;
};

export const listMinhasNotificacoes = async (page = 0, size = 20): Promise<PagedResponse<Notificacao>> =>
    (await api.get('/api/notificacoes/notificacao/minhas', {params: {page, size}})).data;

export const countNaoLidas = async (): Promise<number> =>
    (await api.get('/api/notificacoes/notificacao/nao-lidas')).data;

export const marcarNotificacaoLida = async (id: number): Promise<Notificacao> =>
    (await api.post(`/api/notificacoes/notificacao/${id}/ler`)).data;

/**
 * Assina o stream SSE (Server-Sent Events) de notificações do React Web
 * (canal WEB). O token JWT vai no query param porque o EventSource dos
 * navegadores não permite cabeçalho Authorization.
 * Retorna uma função que encerra a conexão.
 */
export const subscribeNotificacoesStream = (onMessage: (notification: Notificacao) => void): (() => void) => {
    const saved = localStorage.getItem('olimpio.session');
    if (!saved) return () => {
    };
    const session = JSON.parse(saved) as { accessToken: string; expiresAt: number };
    if (session.expiresAt * 1000 <= Date.now()) return () => {
    };
    const base = (api.defaults.baseURL || 'http://localhost:8080').replace(/\/+$/, '');
    const url = `${base}/api/notificacoes/stream/WEB?token=${encodeURIComponent(session.accessToken)}`;
    const source = new EventSource(url);
    source.onmessage = (event) => {
        try {
            onMessage(JSON.parse(event.data) as Notificacao);
        } catch {
            // evento SSE inválido - ignora
        }
    };
    return () => source.close();
};

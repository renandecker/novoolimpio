import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from './api';
import type {PagedResponse} from './types';

export type Notificacao = {
    id: number;
    username: string;
    titulo: string;
    mensagem: string | null;
    tipo: string | null;
    link: string | null;
    lida: boolean;
    createdAt: string;
};

export const listMinhasNotificacoes = async (page = 0, size = 20): Promise<PagedResponse<Notificacao>> =>
    (await api.get('/api/notificacoes/notificacao/minhas', {params: {page, size}})).data;

export const countNaoLidas = async (): Promise<number> =>
    (await api.get('/api/notificacoes/notificacao/nao-lidas')).data;

export const marcarNotificacaoLida = async (id: number): Promise<Notificacao> =>
    (await api.post(`/api/notificacoes/notificacao/${id}/ler`)).data;

/**
 * Assina o stream SSE (Server-Sent Events) de notificações do React Native
 * (canal MOBILE). Usa XMLHttpRequest com leitura incremental da resposta
 * (o RN não expõe EventSource nativo de forma confiável). O token JWT vai no
 * query param. Retorna uma função que encerra a conexão.
 */
export const subscribeNotificacoesStream = (onMessage: (notification: Notificacao) => void): (() => void) => {
    let stopped = false;
    let xhr: XMLHttpRequest | null = null;
    let buffer = '';
    let lastLength = 0;

    const parseChunk = (chunk: string) => {
        buffer += chunk;
        const events = buffer.split('\n\n');
        buffer = events.pop() ? ? '';
        for (const event of events) {
            const line = event.split('\n').find((l) => l.trimStart().startsWith('data:'));
            if (!line) continue;
            try {
                onMessage(JSON.parse(line.slice(line.indexOf(':') + 1).trim()) as Notificacao);
            } catch {
                // evento SSE inválido - ignora
            }
        }
    };

    (async () => {
        const raw = await AsyncStorage.getItem('olimpio.session');
        if (stopped || !raw) return;
        const session = JSON.parse(raw) as { accessToken: string; expiresAt: number };
        if (session.expiresAt * 1000 <= Date.now()) return;
        const base = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
        xhr = new XMLHttpRequest();
        xhr.open('GET', `${base}/api/notificacoes/stream/MOBILE?token=${encodeURIComponent(session.accessToken)}`, true);
        xhr.responseType = 'text';
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.onreadystatechange = () => {
            if (stopped || !xhr || xhr.readyState < 3 || !xhr.responseText) return;
            const text = xhr.responseText;
            const chunk = text.slice(lastLength);
            lastLength = text.length;
            if (chunk) parseChunk(chunk);
        };
        xhr.onerror = () => {
            // reconexão manual é feita pela próxima invalidação/polling (refetchInterval)
        };
        xhr.send();
    })();

    return () => {
        stopped = true;
        try {
            xhr?.abort();
        } catch {
            // ignora
        }
    };
};

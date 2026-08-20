import {useCallback} from 'react';
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

api.interceptors.request.use((config) => {
    const session = localStorage.getItem('olimpio.session');
    if (session) {
        try {
            const {accessToken} = JSON.parse(session);
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch {
            // ignore parse errors
        }
    }
    return config;
});

export function useApi<T = any>(path: string) {
    const get = useCallback(async (params?: Record<string, any>) => {
        const response = await api.get<T>(path, {params});
        return response.data;
    }, [path]);

    const post = useCallback(async (data: Partial<T>) => {
        const response = await api.post<T>(path, data);
        return response.data;
    }, [path]);

    const put = useCallback(async (id: number | string, data: Partial<T>) => {
        const response = await api.put<T>(`${path}/${id}`, data);
        return response.data;
    }, [path]);

    const del = useCallback(async (id: number | string) => {
        const response = await api.delete(`${path}/${id}`);
        return response.data;
    }, [path]);

    return {get, post, put, delete: del};
}
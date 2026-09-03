import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const api = axios.create({baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'});
api.interceptors.request.use(async config => {
    const raw = await AsyncStorage.getItem('olimpio.session');
    if (raw) {
        const session = JSON.parse(raw);
        if (session.expiresAt * 1000 > Date.now()) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
            if (session.username) config.headers['X-Authenticated-Username'] = session.username;
        } else {
            await AsyncStorage.removeItem('olimpio.session');
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

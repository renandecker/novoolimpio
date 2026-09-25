import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {registrarMobileToken, desativarMobileToken} from './notificacoes';

export type MobilePlatform = 'ANDROID' | 'IOS';

const TOKEN_STORAGE_KEY = 'olimpio.mobile.push.token';
const PLATFORM_STORAGE_KEY = 'olimpio.mobile.push.platform';
const ID_USUARIO_STORAGE_KEY = 'olimpio.mobile.push.idUsuario';

/**
 * Configura o comportamento das notificações quando o app está em primeiro plano
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Obtém o token de push notification (FCM no Android, APNs no iOS)
 * e registra no backend se mudou.
 */
export async function registrarPushToken(idUsuario: number): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Push notifications só funcionam em dispositivo físico');
        return null;
    }

    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.warn('Permissão para notificações não concedida');
        return null;
    }

    // Obtém o token do Expo (que encapsula FCM/APNs)
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    // Detecta plataforma
    const plataforma: MobilePlatform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

    // Verifica se o token mudou
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    const storedPlatform = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
    const storedIdUsuario = await AsyncStorage.getItem(ID_USUARIO_STORAGE_KEY);

    if (storedToken === token && storedPlatform === plataforma && storedIdUsuario === String(idUsuario)) {
        console.log('Token de push não mudou, pulando registro');
        return token;
    }

    try {
        // Registra/atualiza o token no backend
        await registrarMobileToken(idUsuario, token, plataforma);

        // Se havia um token antigo diferente, desativa ele
        if (storedToken && storedToken !== token) {
            const oldIdUsuario = storedIdUsuario ? parseInt(storedIdUsuario, 10) : idUsuario;
            await desativarMobileToken(oldIdUsuario, storedToken).catch(err =>
                console.warn('Falha ao desativar token antigo:', err)
            );
        }

        // Salva o novo token
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
        await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, plataforma);
        await AsyncStorage.setItem(ID_USUARIO_STORAGE_KEY, String(idUsuario));

        console.log('Token de push registrado com sucesso:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Erro ao registrar token de push:', error);
        return null;
    }
}

/**
 * Configura o listener para mudanças no token de push.
 * O Expo pode rotacionar o token periodicamente.
 */
export function configurarTokenListener(idUsuario: number): (() => void) {
    const subscription = Notifications.addPushTokenListener(async (tokenData) => {
        console.log('Token de push mudou:', tokenData.data.substring(0, 20) + '...');
        const plataforma: MobilePlatform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
            const storedIdUsuario = await AsyncStorage.getItem(ID_USUARIO_STORAGE_KEY);
            const oldIdUsuario = storedIdUsuario ? parseInt(storedIdUsuario, 10) : idUsuario;
            
            if (storedToken && storedToken !== tokenData.data) {
                await desativarMobileToken(oldIdUsuario, storedToken).catch(err =>
                    console.warn('Falha ao desativar token antigo no listener:', err)
                );
            }
            await registrarMobileToken(idUsuario, tokenData.data, plataforma);
            await AsyncStorage.setItem(TOKEN_STORAGE_KEY, tokenData.data);
            await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, plataforma);
            await AsyncStorage.setItem(ID_USUARIO_STORAGE_KEY, String(idUsuario));
            console.log('Token atualizado no backend com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar token no listener:', error);
        }
    });

    return () => {
        subscription.remove();
    };
}

/**
 * Remove o token do dispositivo (logout)
 */
export async function removerPushToken(idUsuario: number): Promise<void> {
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
        try {
            await desativarMobileToken(idUsuario, storedToken);
        } catch (error) {
            console.warn('Falha ao desativar token no logout:', error);
        }
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem(PLATFORM_STORAGE_KEY);
        await AsyncStorage.removeItem(ID_USUARIO_STORAGE_KEY);
    }
}

/**
 * Inicializa o sistema de push notifications.
 * Deve ser chamado uma vez no início do app (ex: no App.tsx ou LoginScreen após login).
 */
export async function inicializarPushNotifications(idUsuario: number): Promise<{
    token: string | null;
    cleanup: () => void;
}> {
    const token = await registrarPushToken(idUsuario);
    const cleanup = configurarTokenListener(idUsuario);
    return {token, cleanup};
}
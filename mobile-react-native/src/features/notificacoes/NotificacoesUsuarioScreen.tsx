import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ParamList} from '../../HomeScreen';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do usuário: alterações da sua agenda + alterações no seu cadastro.
 * Reusa o layout da tela de configuração de notificações filtrando USUARIO + AGENDA.
 * Rota: 'view/configuracao/notificacoes-usuario' (outcome do backend normalizado).
 */
export default function NotificacoesUsuarioScreen(
    props: NativeStackScreenProps<ParamList, 'view/configuracao/notificacoes-usuario'>,
) {
    const params = (props.route.params ?? {}) as {username?: string};
    return (
        <ConfiguracaoNotificacoesScreen
            route={{
                ...props.route,
                params: {
                    ...params,
                    categoriasFiltro: ['USUARIO', 'AGENDA'],
                    titulo: 'Notificações do Usuário',
                    subtitulo: 'Alterações da sua agenda e alterações no seu cadastro: escolha os canais de cada tipo.',
                },
            } as never}
            navigation={props.navigation as never}
        />
    );
}

import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ParamList} from '../../HomeScreen';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do aluno logado: criação/cancelamento de contrato, alteração de
 * aula, nota, presença e registro de aula.
 * Reusa o layout da tela de configuração de notificações filtrando ALUNO + CONTRATO + TURMA.
 * Rota: 'view/configuracao/notificacoes-aluno' (outcome do backend normalizado).
 */
export default function NotificacoesAlunoScreen(
    props: NativeStackScreenProps<ParamList, 'view/configuracao/notificacoes-aluno'>,
) {
    const params = (props.route.params ?? {}) as {username?: string};
    return (
        <ConfiguracaoNotificacoesScreen
            route={{
                ...props.route,
                params: {
                    ...params,
                    categoriasFiltro: ['ALUNO', 'CONTRATO', 'TURMA'],
                    titulo: 'Notificações do Aluno',
                    subtitulo: 'Contrato, aula, nota, presença e registro de aula: escolha os canais de cada tipo.',
                },
            } as never}
            navigation={props.navigation as never}
        />
    );
}

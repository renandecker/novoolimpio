import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ParamList} from '../../HomeScreen';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do professor logado: perguntas respondidas do aluno, alterações
 * da turma vinculada (status/dia de aula) e alterações do seu registro.
 * Reusa o layout da tela de configuração de notificações filtrando PROFESSOR.
 * Rota: 'view/configuracao/notificacoes-professor' (outcome do backend normalizado).
 */
export default function NotificacoesProfessorScreen(
    props: NativeStackScreenProps<ParamList, 'view/configuracao/notificacoes-professor'>,
) {
    const params = (props.route.params ?? {}) as {username?: string};
    return (
        <ConfiguracaoNotificacoesScreen
            route={{
                ...props.route,
                params: {
                    ...params,
                    categoriasFiltro: ['PROFESSOR'],
                    titulo: 'Notificações do Professor',
                    subtitulo: 'Perguntas respondidas, turma vinculada e seu registro: escolha os canais de cada tipo.',
                },
            } as never}
            navigation={props.navigation as never}
        />
    );
}

import React from 'react';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do professor logado: perguntas respondidas do aluno, alterações
 * da turma vinculada (status/dia de aula) e alterações do seu registro.
 * Reusa o layout de /view/configuracao/notificacoes filtrando PROFESSOR.
 */
export default function NotificacoesProfessorScreen({ username }: { username?: string }) {
  return (
    <ConfiguracaoNotificacoesScreen
      username={username}
      categoriasFiltro={['PROFESSOR']}
      titulo="Notificações do Professor"
      subtitulo="Perguntas respondidas, turma vinculada e seu registro: escolha os canais de cada tipo."
    />
  );
}

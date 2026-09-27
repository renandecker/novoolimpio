import React from 'react';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do aluno logado: criação/cancelamento de contrato, alteração de
 * aula, nota, presença e registro de aula.
 * Reusa o layout de /view/configuracao/notificacoes filtrando ALUNO + CONTRATO + TURMA.
 */
export default function NotificacoesAlunoScreen({ username }: { username?: string }) {
  return (
    <ConfiguracaoNotificacoesScreen
      username={username}
      categoriasFiltro={['ALUNO', 'CONTRATO', 'TURMA']}
      titulo="Notificações do Aluno"
      subtitulo="Contrato, aula, nota, presença e registro de aula: escolha os canais de cada tipo."
    />
  );
}

import React from 'react';
import ConfiguracaoNotificacoesScreen from './ConfiguracaoNotificacoesScreen';

/**
 * Notificações do usuário: alterações da sua agenda + alterações no seu cadastro.
 * Reusa o layout de /view/configuracao/notificacoes filtrando USUARIO + AGENDA.
 */
export default function NotificacoesUsuarioScreen({ username }: { username?: string }) {
  return (
    <ConfiguracaoNotificacoesScreen
      username={username}
      categoriasFiltro={['USUARIO', 'AGENDA']}
      titulo="Notificações do Usuário"
      subtitulo="Alterações da sua agenda e alterações no seu cadastro: escolha os canais de cada tipo."
    />
  );
}

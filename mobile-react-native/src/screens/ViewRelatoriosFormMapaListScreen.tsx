import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewRelatoriosFormMapaListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'definicao', label: 'Definição', path: '/api/relatorios/mapa' },
        { key: 'permissao', label: 'Permissão', empty: 'Usuários, unidades e perfis com acesso ao mapa.' },
        { key: 'regras', label: 'Regras', empty: 'Regras de marcação do mapa.' },
        { key: 'filtros', label: 'Filtros', path: '/api/relatorios/filtros' },
      ]}
    />
  );
}

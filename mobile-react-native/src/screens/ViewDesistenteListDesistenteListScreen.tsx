import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewDesistenteListDesistenteListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'indivname', label: 'Regra', path: '/api/educacao/desistente' },
        { key: 'cancelamento', label: 'Cancelamento', path: '/api/educacao/matricula' },
      ]}
    />
  );
}

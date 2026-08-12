import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function AuditoriaScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'matricula', label: 'Matrícula', empty: 'Auditoria de alterações da matrícula.' },
        { key: 'oferecimento', label: 'Oferecimentos', empty: 'Auditoria de alterações de oferecimentos.' },
      ]}
    />
  );
}

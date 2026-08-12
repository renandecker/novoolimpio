import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewMatriculaFormRematriculaListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato' },
        { key: 'tabMatricula', label: 'Matrícula/Rematrícula', path: '/api/educacao/matricula' },
        { key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto' },
        { key: 'tabValores', label: 'Valores', path: '/api/educacao/valor-curso' },
      ]}
    />
  );
}

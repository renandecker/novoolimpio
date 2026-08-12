import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewConsultorConsultorListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'consultor', label: 'Consultor', path: '/api/comercial/consultor' },
        { key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato' },
        { key: 'tabMatricula', label: 'Matrícula', path: '/api/educacao/matricula' },
        { key: 'tabRematricula', label: 'Rematrícula', path: '/api/educacao/matricula' },
        { key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto' },
        { key: 'tabValores', label: 'Valores', path: '/api/educacao/valor-curso' },
      ]}
    />
  );
}

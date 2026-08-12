import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewComponenteCurricularFormComponenteCurricularListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'componenteCurricular', label: 'Componente Curricular', path: '/api/educacao/componente-curricular' },
        { key: 'habilidadeCompetencia', label: 'Habilidade e Competência', path: '/api/educacao/componente-curricular' },
        { key: 'baseTecnologica', label: 'Base Tecnológica', path: '/api/educacao/base-tecnologica' },
        { key: 'cronograma', label: 'Plano de Aula', path: '/api/educacao/cronograma-componente-curricular' },
        { key: 'referenciaBibliografica', label: 'Referência Bibliográfica', path: '/api/educacao/referencia-bibliografica' },
      ]}
    />
  );
}

import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewCurriculoFormCurriculoListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'curriculo', label: 'Curso', path: '/api/view/curriculo/formCurriculo' },
        { key: 'licenca', label: 'Licença', empty: 'Informações de licença do curso.' },
        { key: 'matrizCurricular', label: 'Matriz Curricular', empty: 'Componentes curriculares da matriz.' },
        { key: 'requisitos', label: 'Requisitos', empty: 'Requisitos da matriz curricular.' },
        { key: 'unidade', label: 'Unidade', empty: 'Unidades vinculadas ao curso.' },
        { key: 'material', label: 'Material', empty: 'Material escolar do curso.' },
        { key: 'contrato', label: 'Documentos', empty: 'Contratos, promissórias, certificados e boletins.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

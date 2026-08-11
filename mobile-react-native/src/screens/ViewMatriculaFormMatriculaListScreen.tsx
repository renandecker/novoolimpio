import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewMatriculaFormMatriculaListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'matricula', label: 'Matrícula', path: '/api/view/matricula/formMatricula' },
        { key: 'material', label: 'Material', empty: 'Material escolar da matrícula.' },
        { key: 'valores', label: 'Valores', empty: 'Valores da matrícula.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

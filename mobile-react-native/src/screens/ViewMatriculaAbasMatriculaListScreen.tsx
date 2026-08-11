import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewMatriculaAbasMatriculaListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'material', label: 'Material', path: '/api/view/matricula/abasMatricula' },
        { key: 'valores', label: 'Valores', empty: 'Valores da matrícula.' },
        { key: 'curso', label: 'Curso', empty: 'Curso da matrícula.' },
        { key: 'produtos', label: 'Produtos', empty: 'Produtos vinculados.' },
        { key: 'parcelado', label: 'Parcelado', empty: 'Parcelamento da matrícula.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

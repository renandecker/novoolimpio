import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewDesistenteFormDesistenteListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'dados', label: 'Dados', path: '/api/view/desistente/formDesistente', empty: 'Informações do aluno que está desistindo.' },
        { key: 'motivo', label: 'Motivo', empty: 'Motivo da desistência.' },
        { key: 'confirmacao', label: 'Confirmação', empty: 'Confirme a desistência do aluno.', nextLabel: 'Finalizar' },
      ]}
    />
  );
}

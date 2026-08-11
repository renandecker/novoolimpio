import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewConsultorFormConsultorListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'contato', label: 'Contato', empty: 'Nome, e-mail, telefone e situação do consultor.' },
        { key: 'acoes', label: 'Ações', path: '/api/view/consultor/formConsultor', empty: 'Ações vinculadas ao consultor.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewNapFormLigacaoNapListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'ligacao', label: 'Dados da Ligação', path: '/api/view/nap/formLigacaoNap', empty: 'Informações do contato e da ligação.' },
        { key: 'resultado', label: 'Resultado', empty: 'Resultado da ligação NAP.' },
        { key: 'historico', label: 'Histórico', empty: 'Histórico de ligações do contato.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

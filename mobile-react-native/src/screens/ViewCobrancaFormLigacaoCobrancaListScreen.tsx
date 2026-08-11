import React from 'react';
import { ModuleWizard } from '../ModuleWizard';
export default function ViewCobrancaFormLigacaoCobrancaListScreen() {
  return (
    <ModuleWizard
      steps={[
        { key: 'ligacao', label: 'Dados da Ligação', path: '/api/view/cobranca/formLigacaoCobranca', empty: 'Informações do contato e da ligação.' },
        { key: 'resultado', label: 'Resultado', empty: 'Resultado da ligação de cobrança.' },
        { key: 'historico', label: 'Histórico', empty: 'Histórico de ligações do contato.', nextLabel: 'Salvar' },
      ]}
    />
  );
}

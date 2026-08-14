import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewLigacaoLigacaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Ligacao</h1>
        <ModuleTabs
          tabs={[
            { key: 'historicoDeLigacoes', label: 'Histórico de Ligações', path: '/api/view/ligacao/ligacao' },
            { key: 'retornoDeLigacoes', label: 'Retorno de Ligações', empty: 'Conteúdo de Retorno de Ligações.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

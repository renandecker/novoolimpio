import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Resultado Ligacao Nap</h1>
        <ModuleTabs
          tabs={[
            { key: 'historicoDeLigacoes', label: 'Histórico de Ligações', path: '/api/view/resultadoLigacaoNap/listResultadoLigacaoNap' },
            { key: 'retornoDeLigacoes', label: 'Retorno de Ligações', empty: 'Conteúdo de Retorno de Ligações.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

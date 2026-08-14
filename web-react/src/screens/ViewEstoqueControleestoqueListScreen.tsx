import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH } from '../masterDetailSources';

export default function ViewEstoqueControleestoqueListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Controle Estoque</h1>
        <ModuleTabs
          tabs={[
            { key: 'produtosEstoqueCentral', label: 'Produtos Estoque Central', path: '/api/estoque/controle-estoque' },
            { key: 'solicitacoes', label: 'Solicitações', empty: 'Conteúdo de Solicitações.' },
            { key: 'pedidos', label: 'Pedidos', empty: 'Conteúdo de Pedidos.' },
            { key: 'entregas', label: 'Entregas', empty: 'Conteúdo de Entregas.' },
            { key: 'produtosUnidade', label: 'Produtos Unidade', masterDetail: { label: 'Produtos Unidade', source: UNIDADE_SOURCE, valueKey: 'id', searchKeys: UNIDADE_SEARCH, columns: UNIDADE_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

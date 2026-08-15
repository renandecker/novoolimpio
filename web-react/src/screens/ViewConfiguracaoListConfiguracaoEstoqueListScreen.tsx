import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewConfiguracaoListConfiguracaoEstoqueListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Configuracao Estoque</h1>
        <ModuleTabs
          tabs={[
            { key: 'geral', label: 'Geral', path: '/api/view/configuracao/listConfiguracaoEstoque' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

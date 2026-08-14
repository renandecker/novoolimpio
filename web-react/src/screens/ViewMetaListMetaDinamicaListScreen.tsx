import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewMetaListMetaDinamicaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Meta Dinamica</h1>
        <ModuleTabs
          tabs={[
            { key: 'meta', label: 'Meta', path: '/api/view/meta/listMetaDinamica' },
            { key: 'item2', label: 'Item 2', empty: 'Conteúdo de Item 2.' },
            { key: 'listagem', label: 'Listagem', empty: 'Conteúdo de Listagem.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH } from '../masterDetailSources';

export default function ViewUnidadeFormUnidadeListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Unidade</h1>
        <ModuleTabs
          tabs={[
            { key: 'geral', label: 'Geral', path: '/api/view/unidade/formUnidade' },
            { key: 'endereco', label: 'Endereço', empty: 'Conteúdo de Endereço.' },
            { key: 'turnoTrabalho', label: 'Turno Trabalho', masterDetail: { label: 'Turno Trabalho', source: TURNO_TRABALHO_SOURCE, valueKey: 'id', searchKeys: TURNO_TRABALHO_SEARCH, columns: TURNO_TRABALHO_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

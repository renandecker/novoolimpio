import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH } from '../masterDetailSources';

export default function ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Oferecimento Componente Curricular</h1>
        <ModuleTabs
          tabs={[
            { key: 'informacoes', label: 'Informações', path: '/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular' },
            { key: 'disponibilidade', label: 'Disponibilidade', empty: 'Conteúdo de Disponibilidade.' },
            { key: 'componenteCurricular', label: 'Componente Curricular', masterDetail: { label: 'Componente Curricular', source: COMPONENTE_SOURCE, valueKey: 'id', searchKeys: COMPONENTE_SEARCH, columns: COMPONENTE_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

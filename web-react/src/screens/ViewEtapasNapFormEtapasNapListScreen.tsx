import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { ETAPAS_NAP_SOURCE, ETAPAS_NAP_COLUMNS, ETAPAS_NAP_SEARCH, PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH, UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH, USUARIO_SOURCE, USUARIO_COLUMNS, USUARIO_SEARCH } from '../masterDetailSources';

export default function ViewEtapasNapFormEtapasNapListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Etapas Nap</h1>
        <ModuleTabs
          tabs={[
            { key: 'geral', label: 'Geral', path: '/api/view/etapasNap/formEtapasNap' },
            { key: 'resultado', label: 'Resultado', empty: 'Conteúdo de Resultado.' },
            { key: 'usuario', label: 'Usuário', masterDetail: { label: 'Usuário', source: USUARIO_SOURCE, valueKey: 'id', searchKeys: USUARIO_SEARCH, columns: USUARIO_COLUMNS } },
            { key: 'perfil', label: 'Perfil', masterDetail: { label: 'Perfil', source: PERFIL_SOURCE, valueKey: 'id', searchKeys: PERFIL_SEARCH, columns: PERFIL_COLUMNS } },
            { key: 'contratante', label: 'Contratante', empty: 'Conteúdo de Contratante.' },
            { key: 'aluno', label: 'Aluno', empty: 'Conteúdo de Aluno.' },
            { key: 'unidade', label: 'Unidade', masterDetail: { label: 'Unidade', source: UNIDADE_SOURCE, valueKey: 'id', searchKeys: UNIDADE_SEARCH, columns: UNIDADE_COLUMNS } },
            { key: 'etapas', label: 'Etapas', masterDetail: { label: 'Etapas', source: ETAPAS_NAP_SOURCE, valueKey: 'id', searchKeys: ETAPAS_NAP_SEARCH, columns: ETAPAS_NAP_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

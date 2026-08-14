import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { CAMPO_SOURCE, CAMPO_COLUMNS, CAMPO_SEARCH, PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH, UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH } from '../masterDetailSources';

export default function ViewConfiguracaoListConfiguracaoParcelaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Configuracao Parcela</h1>
        <ModuleTabs
          tabs={[
            { key: 'regras', label: 'Regras', path: '/api/view/configuracao/listConfiguracaoParcela' },
            { key: 'variaveis', label: 'Variáveis', empty: 'Conteúdo de Variáveis.' },
            { key: 'geral', label: 'Geral', empty: 'Conteúdo de Geral.' },
            { key: 'camposValor', label: 'Campos valor', masterDetail: { label: 'Campos valor', source: CAMPO_SOURCE, valueKey: 'id', searchKeys: CAMPO_SEARCH, columns: CAMPO_COLUMNS } },
            { key: 'horasEAulas', label: 'Horas e aulas', empty: 'Conteúdo de Horas e aulas.' },
            { key: 'camposPresenca', label: 'Campos presença', masterDetail: { label: 'Campos presença', source: CAMPO_SOURCE, valueKey: 'id', searchKeys: CAMPO_SEARCH, columns: CAMPO_COLUMNS } },
            { key: 'informacoes', label: 'Informações', empty: 'Conteúdo de Informações.' },
            { key: 'corpo', label: 'Corpo', empty: 'Conteúdo de Corpo.' },
            { key: 'condicao', label: 'Condição', empty: 'Conteúdo de Condição.' },
            { key: 'unidade', label: 'Unidade', masterDetail: { label: 'Unidade', source: UNIDADE_SOURCE, valueKey: 'id', searchKeys: UNIDADE_SEARCH, columns: UNIDADE_COLUMNS } },
            { key: 'perfil', label: 'Perfil', masterDetail: { label: 'Perfil', source: PERFIL_SOURCE, valueKey: 'id', searchKeys: PERFIL_SEARCH, columns: PERFIL_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}

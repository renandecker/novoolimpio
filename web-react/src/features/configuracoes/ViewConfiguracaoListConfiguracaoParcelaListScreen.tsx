import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import type {DataTableColumn} from '../../shared/components/DataTable';
import {
    CAMPO_SOURCE,
    CAMPO_COLUMNS,
    CAMPO_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH
} from '../../shared/services/masterDetailSources';

const CONFIGURACAO_PARCELA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID da ConfiguraÃ§Ã£o de Parcela'},
    {key: 'unidade_descricao', label: 'Unidade'},
];

export default function ViewConfiguracaoListConfiguracaoParcelaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Configuracao Parcela</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'regras',
                            label: 'Regras',
                            path: '/api/view/configuracao/listConfiguracaoParcela',
                            columns: CONFIGURACAO_PARCELA_COLUMNS,
                            maxMainColumns: CONFIGURACAO_PARCELA_COLUMNS.length
                        },
                        {key: 'variaveis', label: 'VariÃ¡veis', empty: 'ConteÃºdo de VariÃ¡veis.'},
                        {key: 'geral', label: 'Geral', empty: 'ConteÃºdo de Geral.'},
                        {
                            key: 'camposValor',
                            label: 'Campos valor',
                            masterDetail: {
                                label: 'Campos valor',
                                source: CAMPO_SOURCE,
                                valueKey: 'id',
                                searchKeys: CAMPO_SEARCH,
                                columns: CAMPO_COLUMNS
                            }
                        },
                        {key: 'horasEAulas', label: 'Horas e aulas', empty: 'ConteÃºdo de Horas e aulas.'},
                        {
                            key: 'camposPresenca',
                            label: 'Campos presenÃ§a',
                            masterDetail: {
                                label: 'Campos presenÃ§a',
                                source: CAMPO_SOURCE,
                                valueKey: 'id',
                                searchKeys: CAMPO_SEARCH,
                                columns: CAMPO_COLUMNS
                            }
                        },
                        {key: 'informacoes', label: 'InformaÃ§Ãµes', empty: 'ConteÃºdo de InformaÃ§Ãµes.'},
                        {key: 'corpo', label: 'Corpo', empty: 'ConteÃºdo de Corpo.'},
                        {key: 'condicao', label: 'CondiÃ§Ã£o', empty: 'ConteÃºdo de CondiÃ§Ã£o.'},
                        {
                            key: 'unidade',
                            label: 'Unidade',
                            masterDetail: {
                                label: 'Unidade',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
                            }
                        },
                        {
                            key: 'perfil',
                            label: 'Perfil',
                            masterDetail: {
                                label: 'Perfil',
                                source: PERFIL_SOURCE,
                                valueKey: 'id',
                                searchKeys: PERFIL_SEARCH,
                                columns: PERFIL_COLUMNS
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

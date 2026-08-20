import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import type {DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';
import {COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH} from '../masterDetailSources';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const OFERECIMENTO_COLUMNS: DataTableColumn[] = [
    {key: 'id_grupo', label: 'Grupo'},
    {key: 'id_unidade', label: 'Unidade'},
    {key: 'id_curso', label: 'Curso'},
    {key: 'id_componente_curricular', label: 'Componente Curricular'},
    {key: 'id_sala', label: 'Sala'},
    {
        key: 'inscritos',
        label: 'Inscritos / Vagas',
        render: (item) => {
            const record = asRecord(item);
            return `${record.inscritos ?? 0} / ${record.vagas ?? 0}`;
        },
    },
    {key: 'id_professor', label: 'Professor'},
    {key: 'data_inicio', label: 'Data Início', render: (item) => formatDate(asRecord(item).data_inicio)},
    {key: 'data_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).data_fim)},
    {
        key: 'fl_replicar',
        label: 'Replicar',
        render: (item) => (asRecord(item).fl_replicar ? 'Sim' : 'Não'),
    },
    {key: 'status', label: 'Status'},
];

export default function ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Oferecimento Componente Curricular</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoes',
                            label: 'Informações',
                            path: '/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular',
                            columns: OFERECIMENTO_COLUMNS,
                            maxMainColumns: OFERECIMENTO_COLUMNS.length,
                        },
                        {key: 'disponibilidade', label: 'Disponibilidade', empty: 'Conteúdo de Disponibilidade.'},
                        {
                            key: 'componenteCurricular',
                            label: 'Componente Curricular',
                            masterDetail: {
                                label: 'Componente Curricular',
                                source: COMPONENTE_SOURCE,
                                valueKey: 'id',
                                searchKeys: COMPONENTE_SEARCH,
                                columns: COMPONENTE_COLUMNS
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

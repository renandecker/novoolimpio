import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import type {DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';
import {
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
    TURMA_SOURCE,
    TURMA_COLUMNS,
    TURMA_SEARCH
} from '../../shared/services/masterDetailSources';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const TURMA_FINALIZANDO_COLUMNS: DataTableColumn[] = [
    {key: 'data_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).data_fim)},
    {
        key: 'turma',
        label: 'Turma',
        render: (item) => {
            const record = asRecord(item);
            return [record.sala_descricao, record.componente_curricular_descricao, record.data_inicio ? formatDate(record.data_inicio) : '']
                .filter(Boolean)
                .join(' ');
        },
    },
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
];

export default function ViewTurmaListTurmaFinalizandoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Turma Finalizando</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'matriculas',
                            label: 'MatrÃ­culas',
                            path: '/api/view/turma/listTurmaFinalizando',
                            columns: TURMA_FINALIZANDO_COLUMNS,
                            maxMainColumns: TURMA_FINALIZANDO_COLUMNS.length,
                        },
                        {key: 'notas', label: 'Notas', empty: 'ConteÃºdo de Notas.'},
                        {key: 'presencas', label: 'PresenÃ§as', empty: 'ConteÃºdo de PresenÃ§as.'},
                        {key: 'diasAula', label: 'Dias Aula', empty: 'ConteÃºdo de Dias Aula.'},
                        {key: 'comparativoAula', label: 'Comparativo Aula', empty: 'ConteÃºdo de Comparativo Aula.'},
                        {key: 'professor', label: 'Professor', empty: 'ConteÃºdo de Professor.'},
                        {
                            key: 'selecionandoAluno',
                            label: 'Selecionando Aluno',
                            empty: 'ConteÃºdo de Selecionando Aluno.'
                        },
                        {
                            key: 'selecionandoNovaTurma',
                            label: 'Selecionando nova Turma',
                            masterDetail: {
                                label: 'Selecionando nova Turma',
                                source: TURMA_SOURCE,
                                valueKey: 'id',
                                searchKeys: TURMA_SEARCH,
                                columns: TURMA_COLUMNS
                            }
                        },
                        {key: 'informacoes', label: 'InformaÃ§Ãµes', empty: 'ConteÃºdo de InformaÃ§Ãµes.'},
                        {key: 'disponibilidade', label: 'Disponibilidade', empty: 'ConteÃºdo de Disponibilidade.'},
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

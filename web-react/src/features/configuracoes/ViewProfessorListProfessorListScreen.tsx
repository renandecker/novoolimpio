import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'dt_inicio', label: 'Data InÃ­cio', render: (item) => formatDate(asRecord(item).dt_inicio)},
    {key: 'dt_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).dt_fim)},
    {key: 'pessoa_descricao', label: 'Nome'},
    {key: 'fl_ativo', label: 'Ativo', render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'NÃ£o')},
    {
        key: 'caderno_bola',
        label: 'Caderno Chamada Interativo',
        render: (item) => (asRecord(item).caderno_bola ? 'Sim' : 'NÃ£o'),
    },
];

export default function ViewProfessorListProfessorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Professor</h1>
                <DataTable path="/api/view/professor/listProfessor" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

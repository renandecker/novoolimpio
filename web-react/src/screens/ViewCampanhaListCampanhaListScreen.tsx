import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
    {key: 'data_inicial', label: 'Data Inicial', render: (item) => formatDate(asRecord(item).data_inicial)},
    {
        key: 'fl_ativo',
        label: 'Ativo',
        render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'Não'),
    },
    {key: 'meta', label: 'Meta'},
];

export default function ViewCampanhaListCampanhaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Campanha</h1>
                <DataTable path="/api/view/campanha/listCampanha" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

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
    {key: 'nome', label: 'Nome'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'nota', label: 'Nota'},
    {
        key: 'data_cadastramento',
        label: 'Data Cadastro',
        render: (item) => formatDate(asRecord(item).data_cadastramento)
    },
    {key: 'data_alteracao', label: 'Data Alteração', render: (item) => formatDate(asRecord(item).data_alteracao)},
];

export default function ViewProspectoListProspectoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Prospecto</h1>
                <DataTable path="/api/view/prospecto/listProspecto" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

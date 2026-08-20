import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razao_social', label: 'Razão Social'},
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'cnpj', label: 'CNPJ'},
    {key: 'fl_ativo', label: 'Ativo', render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'Não')},
];

export default function ViewUnidadeListUnidadeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Unidade</h1>
                <DataTable path="/api/view/unidade/listUnidade" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

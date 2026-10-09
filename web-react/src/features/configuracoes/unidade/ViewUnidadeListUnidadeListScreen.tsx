import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

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
                <DataTable
                    path="/api/view/unidade/listUnidade"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/unidade/formUnidade"
                />
            </main>
        </PermissionGate>
    );
}

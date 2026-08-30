import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razao_social', label: 'RazÃ£o Social'},
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'cnpj', label: 'CNPJ'},
    {key: 'fl_ativo', label: 'Ativo', render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'NÃ£o')},
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

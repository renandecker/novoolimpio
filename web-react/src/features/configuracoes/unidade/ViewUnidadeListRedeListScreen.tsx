import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'usuario_descricao', label: 'Login', render: (item) => String(asRecord(item).usuario_descricao ?? asRecord(item).usuario_login ?? asRecord(item).usuario ?? '')},
    {key: 'usuario_nome', label: 'Nome Responsável', render: (item) => String(asRecord(item).usuario_nome ?? asRecord(item).nome_responsavel ?? asRecord(item).usuario_pessoa_nome ?? '')},
    {key: 'razao_social', label: 'Razão Social'},
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'cnpj', label: 'CNPJ'},
];

export default function ViewUnidadeListRedeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Rede</h1>
                <DataTable
                    path="/api/view/unidade/listRede"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/unidade/formRede"
                    createNavigateTo="/view/unidade/formRede"
                />
            </main>
        </PermissionGate>
    );
}

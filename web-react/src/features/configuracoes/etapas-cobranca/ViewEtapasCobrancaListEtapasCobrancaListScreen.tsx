import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const renderSimNao = (key: string) => (item: ApiItem) => {
    const value = asRecord(item)[key];
    if (value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'S' || value === 'Sim' || value === 'SIM') return 'Sim';
    if (value === false || value === 0 || value === '0' || value === 'false' || value === 'FALSE' || value === 'N' || value === 'Não' || value === 'NAO' || value === 'NÃO') return 'Não';
    return String(value ?? '');
};

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
    {key: 'ordem', label: 'Ordem'},
    {key: 'customizado', label: 'Customizado', render: renderSimNao('customizado')},
    {key: 'usuario', label: 'Todos usuários', render: renderSimNao('usuario')},
];

export default function ViewEtapasCobrancaListEtapasCobrancaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Etapas Cobrança</h1>
                <DataTable
                    path="/api/view/etapasCobranca/listEtapasCobranca"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/etapasCobranca/formEtapasCobranca"
                    createNavigateTo="/view/etapasCobranca/formEtapasCobranca"
                />
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const renderSimNao = (key: string) => (item: ApiItem) => {
    const value = asRecord(item)[key];
    if (value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'S' || value === 'Sim' || value === 'SIM') return 'Sim';
    if (value === false || value === 0 || value === '0' || value === 'false' || value === 'FALSE' || value === 'N' || value === 'NÃ£o' || value === 'NAO' || value === 'NÃƒO') return 'NÃ£o';
    return String(value ?? '');
};

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'DescriÃ§Ã£o'},
    {key: 'ordem', label: 'Ordem'},
    {key: 'customizado', label: 'Customizado', render: renderSimNao('customizado')},
    {key: 'usuario', label: 'Todos usuÃ¡rios', render: renderSimNao('usuario')},
];

export default function ViewEtapasCobrancaListEtapasCobrancaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Etapas CobranÃ§a</h1>
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

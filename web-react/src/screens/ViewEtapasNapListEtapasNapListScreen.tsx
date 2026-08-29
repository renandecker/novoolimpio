import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

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

export default function ViewEtapasNapListEtapasNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Etapas NAP</h1>
                <DataTable
                    path="/api/view/etapasNap/listEtapasNap"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/etapasNap/formEtapasNap"
                    createNavigateTo="/view/etapasNap/formEtapasNap"
                />
            </main>
        </PermissionGate>
    );
}
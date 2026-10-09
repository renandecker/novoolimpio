import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID', width: '60px'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'hierarquia', label: 'Hierarquia'},
    {key: 'comunicar', label: 'Comunicar', render: (item) => (asRecord(item).comunicar ? 'Sim' : 'Não')},
];

export default function ViewPerfilListPerfilListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Perfil</h1>
                <DataTable
                    path="/api/view/perfil/listPerfil"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/perfil/formPerfil"
                    createNavigateTo="/view/perfil/formPerfil"
                />
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

const COLUMNS: DataTableColumn[] = [
    {key: 'login', label: 'Login'},
    {key: 'fl_ativo', label: 'Ativo', render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'Não')},
    {key: 'pessoa_descricao', label: 'Nome'},
    {key: 'hierarquia', label: 'Hierarquia'},
];

export default function ViewUsuarioListUsuarioListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Usuario</h1>
                <DataTable path="/api/view/usuario/listUsuario" columns={COLUMNS} maxMainColumns={COLUMNS.length}
                           editNavigateTo="/view/usuario/formUsuario"
                           createNavigateTo="/view/usuario/formUsuario"/>
            </main>
        </PermissionGate>
    );
}

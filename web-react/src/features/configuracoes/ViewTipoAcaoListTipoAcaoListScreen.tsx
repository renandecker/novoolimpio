import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoAcaoListTipoAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>Tipo de Ação</h1>
            <DataTable
                path="/api/view/tipoAcao/listTipoAcao"
                columns={[
                    {key: 'id', label: 'Id'},
                    {key: 'descricao', label: 'Descrição'}
                ]}
            />
        </main>
    </PermissionGate>
}
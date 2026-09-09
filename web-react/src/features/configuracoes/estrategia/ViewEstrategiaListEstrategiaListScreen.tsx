import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEstrategiaListEstrategiaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Estratégia</h1>
                <DataTable
                    path="/api/comercial/estrategia"
                    module="comercial"
                    columns={[
                        {key: 'id', label: 'Id'},
                        {key: 'descricao', label: 'Descrição'}
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

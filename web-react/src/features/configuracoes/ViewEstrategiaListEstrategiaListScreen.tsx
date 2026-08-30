import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEstrategiaListEstrategiaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>EstratÃ©gia</h1>
                <DataTable
                    path="/api/comercial/estrategia"
                    module="comercial"
                    columns={[
                        {key: 'id', label: 'Id'},
                        {key: 'descricao', label: 'DescriÃ§Ã£o'}
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

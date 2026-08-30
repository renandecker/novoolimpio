import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Nome'},
    {key: 'cidade_descricao', label: 'Cidade'},
];

export default function ViewBairroListBairroListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Bairro</h1>
                <DataTable path="/api/view/bairro/listBairro" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

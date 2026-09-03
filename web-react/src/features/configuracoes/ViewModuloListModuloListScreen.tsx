import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'modulo_descricao', label: 'Antecessor'},
    {key: 'rotulo', label: 'Rótulo'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'outcome', label: 'Outcome'},
];

export default function ViewModuloListModuloListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Modulo</h1>
                <DataTable path="/api/view/modulo/listModulo" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

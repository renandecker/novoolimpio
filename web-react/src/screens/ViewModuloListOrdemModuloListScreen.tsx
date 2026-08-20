import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'ordem', label: 'Ordem'},
    {key: 'rotulo', label: 'Modulo'},
];

export default function ViewModuloListOrdemModuloListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Ordem Modulo</h1>
                <DataTable path="/api/view/modulo/listOrdemModulo" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'modulo_descricao', label: 'Antecessor'},
    {key: 'rotulo', label: 'RÃ³tulo'},
    {key: 'descricao', label: 'DescriÃ§Ã£o'},
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

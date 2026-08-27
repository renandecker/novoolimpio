import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
];

export default function ViewTipoCanalListTipoCanalListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Tipo Canal</h1>
                <DataTable path="/api/comercial/tipo-canal/paged" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
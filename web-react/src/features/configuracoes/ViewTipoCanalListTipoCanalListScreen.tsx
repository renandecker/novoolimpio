import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'DescriÃ§Ã£o'},
];

export default function ViewTipoCanalListTipoCanalListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Tipo Canal</h1>
                <DataTable path="/api/comercial/tipo-canal" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

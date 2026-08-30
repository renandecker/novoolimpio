import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID da Escolaridade'},
    {key: 'descricao', label: 'DescriÃ§Ã£o'},
    {key: 'ordem', label: 'Ordem'},
];

export default function ViewEscolaridadeListEscolaridadeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Escolaridade</h1>
                <DataTable path="/api/view/escolaridade/listEscolaridade" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

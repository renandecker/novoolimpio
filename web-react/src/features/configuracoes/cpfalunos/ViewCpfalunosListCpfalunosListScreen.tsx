import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'cpf', label: 'CPF'},
];

export default function ViewCpfalunosListCpfalunosListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cpf Alunos</h1>
                <DataTable path="/api/view/cpfalunos/listCpfalunos" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}

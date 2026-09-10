import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'cpf', label: 'CPF'},
    {key: 'rg', label: 'RG'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'celular', label: 'Celular'},
    {key: 'email', label: 'E-mail'},
];

export default function ViewPessoaListPessoaFisicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Pessoa Fisica</h1>
                <DataTable path="/api/view/pessoa/listPessoaFisica" columns={COLUMNS} maxMainColumns={COLUMNS.length}
                           editNavigateTo="/view/pessoa/formPessoaFisica"
                           createNavigateTo="/view/pessoa/formPessoaFisica"/>
            </main>
        </PermissionGate>
    );
}

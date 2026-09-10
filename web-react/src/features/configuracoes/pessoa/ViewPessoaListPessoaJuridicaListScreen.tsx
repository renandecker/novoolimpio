import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'razao_social', label: 'Razão Social'},
    {key: 'cnpj', label: 'CNPJ'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'celular', label: 'Celular'},
    {key: 'email', label: 'E-mail'},
];

export default function ViewPessoaListPessoaJuridicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Pessoa Juridica</h1>
                <DataTable path="/api/view/pessoa/listPessoaJuridica" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}
                           editNavigateTo="/view/pessoa/formPessoaJuridica"
                           createNavigateTo="/view/pessoa/formPessoaJuridica"/>
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'razao_social', label: 'Razão Social'},
    {key: 'cnpj', label: 'CNPJ'},
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

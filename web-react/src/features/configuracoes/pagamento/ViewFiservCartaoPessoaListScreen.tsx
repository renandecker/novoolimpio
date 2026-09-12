import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';
import {API_PATHS} from '../../../shared/services/apiPaths';

export default function ViewFiservCartaoPessoaListScreen() {
    return <PermissionGate permission="READ">
        <main>
            <h1>Cartões Fiserv</h1>
            <DataTable
                path={API_PATHS.fiserv.cartaoPessoa}
                columns={[
                    {key: 'bin', label: 'BIN'},
                    {key: 'ultimosDigitos', label: 'Sufixo'},
                    {key: 'cpf', label: 'Customer ID (CPF/CNPJ)'},
                    {key: 'nomeTitular', label: 'Cliente Cadastrado'},
                    {key: 'bandeira', label: 'Bandeira'},
                    {key: 'apelido', label: 'Apelido'},
                    {key: 'ativo', label: 'Ativo'},
                ]}
                hideCreate
                hideUpdate
                hideDelete
            />
        </main>
    </PermissionGate>;
}
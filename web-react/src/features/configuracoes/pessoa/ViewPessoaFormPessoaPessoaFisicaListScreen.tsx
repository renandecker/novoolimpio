import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPessoaFormPessoaPessoaFisicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Pessoa Pessoa Fisica</h1><DataTable path="/api/view/pessoa/formPessoaPessoaFisica"/></main>
    </PermissionGate>
}

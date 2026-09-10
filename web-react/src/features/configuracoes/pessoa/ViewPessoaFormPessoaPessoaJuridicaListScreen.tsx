import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPessoaFormPessoaPessoaJuridicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Pessoa Pessoa Juridica</h1><DataTable path="/api/view/pessoa/formPessoaPessoaJuridica"/></main>
    </PermissionGate>
}

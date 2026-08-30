import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewPessoaFormPessoaPessoaUsuarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Pessoa Pessoa Usuario</h1><DataTable path="/api/view/pessoa/formPessoaPessoaUsuario"/></main>
    </PermissionGate>
}
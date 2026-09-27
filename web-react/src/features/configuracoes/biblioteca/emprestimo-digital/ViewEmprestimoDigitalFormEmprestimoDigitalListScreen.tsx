import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable} from '../../../../../shared/components/DataTable';

export default function ViewEmprestimoDigitalFormEmprestimoDigitalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Empréstimo Digital</h1><DataTable path="/api/biblioteca-virtual/emprestimo-digital/formEmprestimoDigital"/></main>
    </PermissionGate>;
}
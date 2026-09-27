import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable} from '../../../../shared/components/DataTable';

export default function ViewLivroDigitalFormLivroDigitalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Livro Digital</h1><DataTable path="/api/biblioteca-virtual/livro-digital/formLivroDigital"/></main>
    </PermissionGate>;
}
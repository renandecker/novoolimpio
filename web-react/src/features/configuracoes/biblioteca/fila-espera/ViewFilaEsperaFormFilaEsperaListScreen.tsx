import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable} from '../../../../shared/components/DataTable';

export default function ViewFilaEsperaFormFilaEsperaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Fila de Espera</h1><DataTable path="/api/biblioteca-virtual/fila-espera/formFilaEspera"/></main>
    </PermissionGate>;
}
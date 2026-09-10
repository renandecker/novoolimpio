import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewRelatoriosDocumentosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Templates de Documentos</h1><DataTable path="/api/relatorios/documentos" module="relatorios" outcome="listDocumentos"/></main>
    </PermissionGate>;
}

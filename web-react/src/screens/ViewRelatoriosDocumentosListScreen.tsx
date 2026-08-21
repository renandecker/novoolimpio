import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosDocumentosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Templates de Documentos</h1><DataTable path="/api/relatorios/documentos" module="relatorios" outcome="listDocumentos"/></main>
    </PermissionGate>;
}
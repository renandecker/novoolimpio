import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Referencia Bibliografica</h1><DataTable
            path="/api/view/referenciaBibliografica/listReferenciaBibliografica"/></main>
    </PermissionGate>
}

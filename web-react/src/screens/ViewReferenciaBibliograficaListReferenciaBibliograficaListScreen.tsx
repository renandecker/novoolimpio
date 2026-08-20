import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Referencia Bibliografica</h1><DataTable
            path="/api/view/referenciaBibliografica/listReferenciaBibliografica"/></main>
    </PermissionGate>
}
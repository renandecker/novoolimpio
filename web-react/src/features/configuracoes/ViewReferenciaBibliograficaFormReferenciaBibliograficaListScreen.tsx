import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Referencia Bibliografica</h1><DataTable
            path="/api/view/referenciaBibliografica/formReferenciaBibliografica"/></main>
    </PermissionGate>
}
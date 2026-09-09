import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Referencia Bibliografica</h1><DataTable
            path="/api/view/referenciaBibliografica/formReferenciaBibliografica"/></main>
    </PermissionGate>
}

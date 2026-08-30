import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewReferenciaBibliograficaColunasReferenciaBibliograficaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Referencia Bibliografica</h1><DataTable
            path="/api/view/referenciaBibliografica/colunasReferenciaBibliografica"/></main>
    </PermissionGate>
}

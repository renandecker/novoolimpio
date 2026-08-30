import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewComponenteCurricularColunasComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Componente Curricular</h1><DataTable
            path="/api/view/componenteCurricular/colunasComponenteCurricular"/></main>
    </PermissionGate>
}
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

const LAYOUT_COMBOS = {tema: {path: '/api/login/temas', valueKey: 'tema', labelKey: 'titulo'}};
export default function ViewConfiguracaoFormLayoutListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Layout</h1><DataTable path="/api/view/configuracao/formLayout" combos={LAYOUT_COMBOS}/></main>
    </PermissionGate>
}

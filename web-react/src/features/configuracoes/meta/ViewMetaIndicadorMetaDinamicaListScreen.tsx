import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';

export default function ViewMetaIndicadorMetaDinamicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Indicador Meta Dinamica</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'meta', label: 'Meta', path: '/api/view/meta/indicadorMetaDinamica'},
                        {key: 'item2', label: 'Item 2', empty: 'Conteúdo de Item 2.'},
                        {key: 'listagem', label: 'Listagem', empty: 'Conteúdo de Listagem.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

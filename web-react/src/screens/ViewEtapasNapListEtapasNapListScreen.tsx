import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewEtapasNapListEtapasNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Etapas Nap</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'mensagem', label: 'Mensagem', path: '/api/view/etapasNap/listEtapasNap'},
                        {key: 'retornos', label: 'Retornos', empty: 'Conteúdo de Retornos.'},
                        {key: 'resumo', label: 'Resumo', empty: 'Conteúdo de Resumo.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

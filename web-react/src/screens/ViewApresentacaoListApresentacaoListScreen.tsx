import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewApresentacaoListApresentacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Apresentacao</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'imagens', label: 'Imagens', path: '/api/view/apresentacao/listApresentacao'},
                        {key: 'videos', label: 'Vídeos', empty: 'Conteúdo de Vídeos.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

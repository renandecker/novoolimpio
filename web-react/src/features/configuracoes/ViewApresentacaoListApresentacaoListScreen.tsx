import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewApresentacaoListApresentacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Apresentacao</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'imagens',
                            label: 'Imagens',
                            path: '/api/educacao/apresentacao/paged',
                            columns: [
                                {key: 'ordem', label: 'Slide Número'},
                                {key: 'local', label: 'Local'},
                            ]
                        },
                        {
                            key: 'videos',
                            label: 'Vídeos',
                            path: '/api/educacao/apresentacaovideo/paged',
                            columns: [
                                {key: 'titulo', label: 'Título'},
                                {key: 'local', label: 'Local'},
                            ]
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

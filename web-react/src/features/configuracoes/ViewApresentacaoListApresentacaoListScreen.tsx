import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';

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
                            path: '/api/educacao/apresentacao',
                            columns: [
                                {key: 'ordem', label: 'Slide NÃºmero'},
                                {key: 'local', label: 'Local'},
                            ]
                        },
                        {
                            key: 'videos',
                            label: 'VÃ­deos',
                            path: '/api/educacao/apresentacaovideo',
                            columns: [
                                {key: 'titulo', label: 'TÃ­tulo'},
                                {key: 'local', label: 'Local'},
                            ]
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';

export default function ViewNapColunasLigacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Ligacao</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'historicoDeLigacoes',
                            label: 'HistÃ³rico de LigaÃ§Ãµes',
                            path: '/api/view/nap/colunasLigacao'
                        },
                        {
                            key: 'retornoDeLigacoes',
                            label: 'Retorno de LigaÃ§Ãµes',
                            empty: 'ConteÃºdo de Retorno de LigaÃ§Ãµes.'
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewResultadoLigacaoNapColunasListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'historicoDeLigacoes',
                            label: 'Histórico de Ligações',
                            path: '/api/view/resultadoLigacaoNap/colunas'
                        },
                        {
                            key: 'retornoDeLigacoes',
                            label: 'Retorno de Ligações',
                            empty: 'Conteúdo de Retorno de Ligações.'
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}

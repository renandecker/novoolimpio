import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Resultado Ligacao Nap</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'historicoDeLigacoes',
                            label: 'Histórico de Ligações',
                            path: '/api/view/resultadoLigacaoNap/formResultadoLigacaoNap'
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

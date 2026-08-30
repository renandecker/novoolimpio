import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';

export default function ViewLigacaoColunasLigacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Ligacao</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'historicoDeLigacoes',
                            label: 'Histórico de Ligações',
                            path: '/api/view/ligacao/colunasLigacao'
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

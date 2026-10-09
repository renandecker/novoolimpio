import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import type {DataTableColumn} from '../../../shared/components/DataTable';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

const renderTela = (item: ApiItem) => {
    const value = asRecord(item).tela;
    if (value === 0 || value === '0') return 'Nenhum';
    if (value === 1 || value === '1') return 'Agendar';
    if (value === 2 || value === '2') return 'Retorno';
    if (value === 3 || value === '3') return 'Curso';
    return String(value ?? '');
};

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
    {key: 'tela', label: 'Tela', render: renderTela},
    {key: 'dias_retorno', label: 'Dias Retorno'},
    {key: 'ordem', label: 'Ordem'},
];

export default function ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Resultado Ligacao Nap</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'historicoDeLigacoes',
                            label: 'Histórico de Ligações',
                            path: '/api/view/resultadoLigacaoNap/listResultadoLigacaoNap',
                            columns: COLUMNS,
                            maxMainColumns: COLUMNS.length,
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

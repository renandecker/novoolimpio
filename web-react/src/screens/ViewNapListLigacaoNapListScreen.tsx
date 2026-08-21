import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Tabs} from '../Tabs';

interface EtapaNap {
    id: number;
    descricao: string;
}

const NAP_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID da Ligação NAP'},
    {key: 'usuarioId', label: 'Usuário ligou'},
    {key: 'dataInicial', label: 'Data início'},
    {key: 'dataFinal', label: 'Data fim'},
    {key: 'compromissoId', label: 'Compromisso'},
    {key: 'resultadoLigacaoNapId', label: 'Resultado ligação NAP'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'observacao', label: 'Observação'},
];

export default function ViewNapListLigacaoNapListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-nap'],
        queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
    });
    const etapas = etapasQuery.data ?? [];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Ligação NAP</h1>
                {etapasQuery.isLoading && etapas.length === 0 ? (
                    <p>Carregando etapas...</p>
                ) : (
                    <Tabs
                        tabs={etapas.map((etapa) => ({
                            key: String(etapa.id),
                            label: etapa.descricao || `Etapa ${etapa.id}`,
                            content: (
                                <DataTable
                                    path="/api/educacao/ligacao-nap"
                                    params={{etapasNapId: etapa.id}}
                                    columns={NAP_COLUMNS}
                                    maxMainColumns={NAP_COLUMNS.length}
                                />
                            ),
                        }))}
                    />
                )}
                {etapasQuery.isError && <p>Erro ao carregar as etapas.</p>}
            </main>
        </PermissionGate>
    );
}

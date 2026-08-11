import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Tabs } from '../Tabs';

interface EtapaCobranca {
  id: number;
  descricao: string;
}

const COBRANCA_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'usuarioId', label: 'Usuário ligou' },
  { key: 'dataInicial', label: 'Data inicial' },
  { key: 'dataFinal', label: 'Data final' },
  { key: 'compromissoId', label: 'Compromisso' },
  { key: 'resultadoCobrancaId', label: 'Resultado ligação' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'qtdeParcela', label: 'Parcelas Pendente' },
  { key: 'valor', label: 'Valor' },
  { key: 'observacao', label: 'Observação' },
];

export default function ViewCobrancaListLigacaoCobrancaListScreen() {
  const etapasQuery = useQuery({
    queryKey: ['etapas-cobranca'],
    queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
  });
  const etapas = etapasQuery.data ?? [];

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Ligação Cobrança</h1>
        {etapasQuery.isLoading && etapas.length === 0 ? (
          <p>Carregando etapas...</p>
        ) : (
          <Tabs
            tabs={etapas.map((etapa) => ({
              key: String(etapa.id),
              label: etapa.descricao || `Etapa ${etapa.id}`,
              content: (
                <DataTable
                  path="/api/financeiro/ligacao-cobranca"
                  params={{ etapasCobrancaId: etapa.id }}
                  columns={COBRANCA_COLUMNS}
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

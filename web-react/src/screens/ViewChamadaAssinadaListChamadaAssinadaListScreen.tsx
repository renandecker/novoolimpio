import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'id_oferecimento_componente_curricular', label: 'Turma' },
  { key: 'sequencia', label: 'Sequência' },
  { key: 'inicio', label: 'Início', render: (item) => formatDate(asRecord(item).inicio) },
  { key: 'fim', label: 'Fim', render: (item) => formatDate(asRecord(item).fim) },
  {
    key: 'pendente',
    label: 'Pendente',
    render: (item) => (asRecord(item).pendente ? 'Sim' : 'Não'),
  },
  { key: 'quantidade', label: 'Qtde' },
  {
    key: 'aula_coringa',
    label: 'Aula Coringa',
    render: (item) => (asRecord(item).aula_coringa ? 'Sim' : 'Não'),
  },
];

export default function ViewChamadaAssinadaListChamadaAssinadaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Chamada Assinada</h1>
        <DataTable path="/api/view/chamadaAssinada/listChamadaAssinada" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'cor', label: 'Cor' },
  { key: 'prox_status_compromisso_descricao', label: 'Próximo Status' },
  { key: 'alguem', label: 'Resultado', render: (item) => (asRecord(item).alguem ? 'Sim' : 'Não') },
  { key: 'trocaautomatomatica', label: 'Automático', render: (item) => (asRecord(item).trocaautomatomatica ? 'Sim' : 'Não') },
  { key: 'dias', label: 'Dias' },
  { key: 'status_troca_auto_descricao', label: 'Status Compromisso Automático' },
];

export default function ViewStatusCompromissoListStatusCompromissoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Status Compromisso</h1>
        <DataTable path="/api/view/statusCompromisso/listStatusCompromisso" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

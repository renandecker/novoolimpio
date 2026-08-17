import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'ativo', label: 'Ativo', render: (item) => (asRecord(item).ativo ? 'Sim' : 'Não') },
];

export default function ViewMotivoListMotivoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Motivo</h1>
        <DataTable path="/api/view/motivo/listMotivo" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

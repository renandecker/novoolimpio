import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'fundo', label: 'Cor Fundo' },
  { key: 'texto', label: 'Cor Texto' },
];

export default function ViewCorListCoresListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Cores</h1>
        <DataTable path="/api/view/cor/listCores" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

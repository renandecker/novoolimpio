import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'nacionalidade', label: 'Nacionalidade' },
];

export default function ViewPaisListPaisListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Pais</h1>
        <DataTable path="/api/view/pais/listPais" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

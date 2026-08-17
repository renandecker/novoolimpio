import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
];

export default function ViewPacoteListPacoteListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Pacote</h1>
        <DataTable path="/api/view/pacote/listPacote" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

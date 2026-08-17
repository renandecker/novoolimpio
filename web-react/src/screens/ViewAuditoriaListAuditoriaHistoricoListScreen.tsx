import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
];

export default function ViewAuditoriaListAuditoriaHistoricoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Auditoria Historico</h1>
        <DataTable
          path="/api/view/auditoria/listAuditoriaHistorico"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}

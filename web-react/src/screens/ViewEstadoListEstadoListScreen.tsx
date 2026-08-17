import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'uf', label: 'UF' },
  { key: 'pais_descricao', label: 'País' },
];

export default function ViewEstadoListEstadoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Estado</h1>
        <DataTable path="/api/view/estado/listEstado" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

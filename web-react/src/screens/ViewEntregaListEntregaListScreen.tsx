import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'pessoa_descricao', label: 'Nome Fantasia' },
  { key: 'longitude', label: 'Longitude Mapa' },
  { key: 'latitude', label: 'Latitude Mapa' },
];

export default function ViewEntregaListEntregaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Entrega</h1>
        <DataTable path="/api/view/entrega/listEntrega" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

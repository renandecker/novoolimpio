import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição' },
];

export default function ViewBaseTecnologicaListBaseTecnologicaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Base Tecnologica</h1>
        <DataTable path="/api/view/baseTecnologica/listBaseTecnologica" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

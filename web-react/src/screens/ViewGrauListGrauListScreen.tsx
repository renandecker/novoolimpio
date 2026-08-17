import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'notas_parciais', label: 'Notas Parciais' },
  { key: 'media_sem_exame', label: 'Média Sem Exame' },
  { key: 'media_final', label: 'Média Final' },
];

export default function ViewGrauListGrauListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Grau</h1>
        <DataTable path="/api/view/grau/listGrau" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

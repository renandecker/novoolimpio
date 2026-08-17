import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'hora', label: 'Hora' },
];

export default function ViewHorarioListHorarioListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Horario</h1>
        <DataTable
          path="/api/view/horario/listHorario"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}

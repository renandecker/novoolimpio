import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'minutos', label: 'Minutos Reais' },
  { key: 'minutos_aula', label: 'Minutos Aula' },
];

export default function ViewTempoAulaListTempoAulaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Tempo Aula</h1>
        <DataTable path="/api/view/tempoAula/listTempoAula" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

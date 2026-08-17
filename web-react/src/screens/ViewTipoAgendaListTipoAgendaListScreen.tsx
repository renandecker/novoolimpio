import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'cor', label: 'Cor' },
];

export default function ViewTipoAgendaListTipoAgendaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Tipo Agenda</h1>
        <DataTable path="/api/view/tipoAgenda/listTipoAgenda" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

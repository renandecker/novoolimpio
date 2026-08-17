import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'inicio', label: 'Início' },
  { key: 'fim', label: 'Fim' },
  { key: 'dia_semana_descricao', label: 'Dia Semana' },
];

export default function ViewTurnoTrabalhoListTurnoTrabalhoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Turno Trabalho</h1>
        <DataTable path="/api/view/turnoTrabalho/listTurnoTrabalho" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

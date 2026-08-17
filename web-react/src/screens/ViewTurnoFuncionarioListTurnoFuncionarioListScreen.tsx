import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
];

export default function ViewTurnoFuncionarioListTurnoFuncionarioListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Turno Funcionario</h1>
        <DataTable path="/api/view/turnoFuncionario/listTurnoFuncionario" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'pacote_descricao', label: 'Pacote' },
  { key: 'status', label: 'Status' },
  { key: 'direcionamento', label: 'Direcionamento' },
];

export default function ViewOperacionalListOperacionalListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Operacional</h1>
        <DataTable path="/api/view/operacional/listOperacional" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

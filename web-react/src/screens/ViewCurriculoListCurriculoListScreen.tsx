import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'curso_descricao', label: 'Curso' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'tipo_curso_descricao', label: 'Tipo Curso' },
  { key: 'data_cancelamento', label: 'Data Cancelamento', render: (item) => formatDate(asRecord(item).data_cancelamento) },
];

export default function ViewCurriculoListCurriculoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Curriculo</h1>
        <DataTable path="/api/view/curriculo/listCurriculo" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

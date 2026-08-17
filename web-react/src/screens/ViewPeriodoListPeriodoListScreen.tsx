import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'data_inicio', label: 'Data Início', render: (item) => formatDate(asRecord(item).data_inicio) },
  { key: 'data_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).data_fim) },
  { key: 'tipo_curso_descricao', label: 'Tipo de Curso' },
];

export default function ViewPeriodoListPeriodoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Periodo</h1>
        <DataTable path="/api/view/periodo/listPeriodo" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

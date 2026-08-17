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
  { key: 'operador_descricao', label: 'Operador' },
  { key: 'meta', label: 'Meta' },
  { key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data) },
  { key: 'data_inicial', label: 'Início', render: (item) => formatDate(asRecord(item).data_inicial) },
  { key: 'data_final', label: 'Fim', render: (item) => formatDate(asRecord(item).data_final) },
];

export default function ViewMetaListMetaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Meta</h1>
        <DataTable path="/api/view/meta/listMeta" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

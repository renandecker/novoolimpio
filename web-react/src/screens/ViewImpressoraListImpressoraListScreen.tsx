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
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'porta', label: 'Porta Virtual' },
  { key: 'modelo', label: 'Modelo Impressora' },
  { key: 'data_alteracao', label: 'Data de Alteração', render: (item) => formatDate(asRecord(item).data_alteracao) },
];

export default function ViewImpressoraListImpressoraListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Impressora</h1>
        <DataTable path="/api/view/impressora/listImpressora" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

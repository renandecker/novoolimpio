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
  { key: 'id_caixa_unidade', label: 'Nº Caixa' },
  { key: 'usuario_descricao', label: 'Usuário' },
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data) },
  { key: 'data_fechamento', label: 'Data Fechamento', render: (item) => formatDate(asRecord(item).data_fechamento) },
  { key: 'fundo_caixa', label: 'Fundo de Caixa' },
];

export default function ViewCaixaListCaixaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Caixa</h1>
        <DataTable path="/api/view/caixa/listCaixa" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

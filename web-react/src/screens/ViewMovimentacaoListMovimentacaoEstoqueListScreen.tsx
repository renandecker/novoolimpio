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
  { key: 'produto_descricao', label: 'Produto' },
  { key: 'usuario_descricao', label: 'Usuário' },
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'tipo', label: 'Tipo Movimentação' },
  {
    key: 'dt_movimento',
    label: 'Data Movimento',
    render: (item) => formatDate(asRecord(item).dt_movimento),
  },
  { key: 'quantidade', label: 'Quantidade' },
];

export default function ViewMovimentacaoListMovimentacaoEstoqueListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Movimentacao Estoque</h1>
        <DataTable path="/api/view/movimentacao/listMovimentacaoEstoque" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

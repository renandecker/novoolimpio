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
  { key: 'usuario_descricao', label: 'Usuário' },
  { key: 'mensagem', label: 'Mensagem' },
  { key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data) },
];

export default function ViewComunicacaoListComunicacaoMensagemListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Comunicacao Mensagem</h1>
        <DataTable path="/api/view/comunicacao/listComunicacaoMensagem" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

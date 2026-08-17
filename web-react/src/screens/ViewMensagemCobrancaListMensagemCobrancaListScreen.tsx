import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'fl_email', label: 'Tipo Mensagem', render: (item) => (asRecord(item).fl_email ? 'Email' : 'SMS') },
];

export default function ViewMensagemCobrancaListMensagemCobrancaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Mensagem Cobranca</h1>
        <DataTable path="/api/view/mensagemCobranca/listMensagemCobranca" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}

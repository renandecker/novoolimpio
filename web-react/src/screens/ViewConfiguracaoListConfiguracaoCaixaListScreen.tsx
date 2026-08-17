import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'usuario_descricao', label: 'Usuário' },
  { key: 'responsavel_descricao', label: 'Autorizador' },
  { key: 'email', label: 'E-mail' },
  { key: 'dias', label: 'Dias' },
  { key: 'impressao', label: 'Impressão' },
  { key: 'fundo_caixa', label: 'Fundo de caixa' },
  { key: 'pag_propria_unid', label: 'Pag. Própria Unid.', render: (item) => (asRecord(item).pag_propria_unid ? 'Sim' : 'Não') },
];

export default function ViewConfiguracaoListConfiguracaoCaixaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Configuracao Caixa</h1>
        <DataTable path="/api/view/configuracao/listConfiguracaoCaixa" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
